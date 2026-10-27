import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from users.models import CustomUser
from .models import Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.other_user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        if self.user.id == self.other_user_id:
            await self.close()
            return

        self.other_user = await self.get_other_user()

        if not self.other_user:
            await self.close()
            return

        user_ids = sorted([self.user.id, self.other_user.id])
        self.room_group_name = f"chat_{user_ids[0]}_{user_ids[1]}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("content", "").strip()

        if not content:
            return

        message = await self.create_message(content)
        serialized_message = await self.serialize_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": serialized_message,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "message",
                **event["message"],
            })
        )

    @database_sync_to_async
    def get_other_user(self):
        try:
            return CustomUser.objects.get(id=self.other_user_id)
        except CustomUser.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, content):
        return Message.objects.create(
            sender=self.user,
            reciever=self.other_user,
            content=content,
        )

    @database_sync_to_async
    def serialize_message(self, message):
        return MessageSerializer(message).data
