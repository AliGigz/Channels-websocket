import json
import time
import traceback

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import CustomUser
from .models import Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("\n========== CONNECT START ==========")
        print("[1] Scope received:")
        print(self.scope)

        self.other_user_id = self.scope["url_route"]["kwargs"]["user_id"]
        print(f"[2] Other user ID: {self.other_user_id}")

        self.user = self.scope["user"]
        print(f"[3] Current user: {self.user}")
        print(f"[3] Current user ID: {self.user.id}")

        if self.user.is_anonymous:
            print("[ERROR] User is anonymous -> closing connection")
            await self.close()
            return

        if self.user.id == self.other_user_id:
            print("[ERROR] User is trying to chat with themselves -> closing")
            await self.close()
            return

        print("[4] Getting other user from database...")

        try:
            self.other_user = await self.get_other_user()
            print(f"[5] Other user result: {self.other_user}")
        except Exception as e:
            print(
                f"[ERROR] get_other_user failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            raise

        if not self.other_user:
            print("[ERROR] Other user does not exist -> closing")
            await self.close()
            return

        user_ids = sorted([self.user.id, self.other_user.id])

        self.room_group_name = f"chat_{user_ids[0]}_{user_ids[1]}"

        print(f"[6] Room group name: {self.room_group_name}")
        print(f"[6] Channel name: {self.channel_name}")

        print("[7] BEFORE channel_layer.group_add()")

        try:
            start_time = time.monotonic()

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            elapsed = time.monotonic() - start_time

            print("[8] AFTER channel_layer.group_add()")
            print(f"[8] group_add took: {elapsed:.3f} seconds")

        except Exception as e:
            print("\n========== GROUP ADD ERROR ==========")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            print(f"[ERROR] Exception: {e!r}")
            print(f"[ERROR] Group name: {self.room_group_name}")
            print(f"[ERROR] Channel name: {self.channel_name}")
            print("[ERROR] Full traceback:")
            traceback.print_exc()
            print("========== GROUP ADD ERROR END ==========\n")
            raise

        print("[9] BEFORE websocket.accept()")

        try:
            await self.accept()
            print("[10] AFTER websocket.accept()")

        except Exception as e:
            print(
                f"[ERROR] websocket.accept() failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            raise

        print("========== CONNECT END ==========\n")

    async def disconnect(self, close_code):
        print("\n========== DISCONNECT ==========")
        print(f"[DISCONNECT] Close code: {close_code}")

        if not hasattr(self, "room_group_name"):
            print("[DISCONNECT] No room_group_name -> nothing to discard")
            return

        print(
            f"[DISCONNECT] BEFORE group_discard(): "
            f"{self.room_group_name}"
        )

        try:
            start_time = time.monotonic()

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            elapsed = time.monotonic() - start_time

            print("[DISCONNECT] AFTER group_discard()")
            print(
                f"[DISCONNECT] group_discard took: "
                f"{elapsed:.3f} seconds"
            )

        except Exception as e:
            print("\n========== GROUP DISCARD ERROR ==========")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            print(f"[ERROR] Exception: {e!r}")
            print(
                f"[ERROR] Group name: "
                f"{self.room_group_name}"
            )
            print(
                f"[ERROR] Channel name: "
                f"{self.channel_name}"
            )
            print("[ERROR] Full traceback:")
            traceback.print_exc()
            print("========== GROUP DISCARD ERROR END ==========\n")

        print("========== DISCONNECT END ==========\n")

    async def receive(self, text_data):
        print("\n========== RECEIVE START ==========")

        print(f"[RECEIVE] Raw data: {text_data}")

        try:
            data = json.loads(text_data)
            print(f"[RECEIVE] Parsed data: {data}")

        except Exception as e:
            print(
                f"[ERROR] JSON parsing failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            return

        content = data.get("content", "").strip()

        print(f"[RECEIVE] Content: {content!r}")

        if not content:
            print("[RECEIVE] Empty content -> returning")
            return

        print("[11] BEFORE create_message()")

        try:
            message = await self.create_message(content)

            print(f"[12] AFTER create_message(): {message}")
            print(f"[12] Message ID: {message.id}")

        except Exception as e:
            print(
                f"[ERROR] create_message failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            raise

        print("[13] BEFORE serialize_message()")

        try:
            serialized_message = await self.serialize_message(message)

            print(
                f"[14] AFTER serialize_message(): "
                f"{serialized_message}"
            )

        except Exception as e:
            print(
                f"[ERROR] serialize_message failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            raise

        print("\n[15] BEFORE channel_layer.group_send()")
        print(f"[15] Group name: {self.room_group_name}")
        print(f"[15] Channel name: {self.channel_name}")
        print(f"[15] Channel layer: {self.channel_layer}")
        print(f"[15] Message: {serialized_message}")

        start_time = time.monotonic()

        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": serialized_message,
                },
            )

            elapsed = time.monotonic() - start_time

            print("[16] AFTER channel_layer.group_send()")
            print(f"[16] group_send took: {elapsed:.3f} seconds")

        except Exception as e:
            elapsed = time.monotonic() - start_time

            print("\n========== GROUP SEND ERROR ==========")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            print(f"[ERROR] Exception: {e!r}")
            print(
                f"[ERROR] Time before failure: "
                f"{elapsed:.3f} seconds"
            )
            print(
                f"[ERROR] Group name: "
                f"{self.room_group_name}"
            )
            print(
                f"[ERROR] Channel name: "
                f"{self.channel_name}"
            )
            print("[ERROR] Full traceback:")
            traceback.print_exc()
            print("========== GROUP SEND ERROR END ==========\n")

            raise

        print("========== RECEIVE END ==========\n")

    async def chat_message(self, event):
        print("\n========== CHAT MESSAGE ==========")
        print(f"[CHAT_MESSAGE] Event: {event}")

        try:
            await self.send(
                text_data=json.dumps({
                    "type": "message",
                    **event["message"],
                })
            )

            print("[CHAT_MESSAGE] Message sent to WebSocket")

        except Exception as e:
            print(
                f"[ERROR] WebSocket send failed: "
                f"{type(e).__name__}: {e}"
            )
            traceback.print_exc()
            raise

        print("========== CHAT MESSAGE END ==========\n")

    @database_sync_to_async
    def get_other_user(self):
        print("[DB] get_other_user() started")

        try:
            user = CustomUser.objects.get(
                id=self.other_user_id
            )

            print(
                f"[DB] get_other_user() success: "
                f"{user} (id={user.id})"
            )

            return user

        except CustomUser.DoesNotExist:
            print(
                f"[DB] User with ID "
                f"{self.other_user_id} does not exist"
            )
            return None

    @database_sync_to_async
    def create_message(self, content):
        print(
            f"[DB] create_message() started | "
            f"sender={self.user.id} | "
            f"receiver={self.other_user.id} | "
            f"content={content!r}"
        )

        message = Message.objects.create(
            sender=self.user,
            reciever=self.other_user,
            content=content,
        )

        print(
            f"[DB] create_message() success | "
            f"message_id={message.id}"
        )

        return message

    @database_sync_to_async
    def serialize_message(self, message):
        print(
            f"[SERIALIZER] serialize_message() started | "
            f"message_id={message.id}"
        )

        serialized = MessageSerializer(message).data

        print(
            f"[SERIALIZER] serialize_message() success: "
            f"{serialized}"
        )

        return serialized