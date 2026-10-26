import { useEffect, useState, useRef } from "react";
import api from "../api";
import { BASEURL } from "../consts";
import { jwtDecode } from "jwt-decode";
import { type User } from "./Profile";

interface Message {
  sender: User;
  reciever: User;
  content: string;
}

interface TokenPayload {
  user_id: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  const access = localStorage.getItem("access");

  const currentUserId = access ? jwtDecode<TokenPayload>(access).user_id : null;

  const getUsers = async () => {
    try {
      const res = await api.get("users/get_user_chats/");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = async (pk: number) => {
    try {
      const res = await api.get(`chat/get_chat_messages/${pk}/`);
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    getMessages(user.pk);

    if (socketRef.current) socketRef.current.close();

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${user.pk}/?token=${localStorage.getItem("access")}`);
    socket.onopen = () => {
      console.log("WebSocket connected");
    };
    socket.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      console.log("received:", message);
      setMessages((prev) => [...prev, message]);
    };
    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };
    socketRef.current = socket;
  };
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    if (!socketRef.current) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not connected");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        content: messageInput,
      }),
    );

    setMessageInput("");
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="flex mx-8 mt-4 h-[calc(100vh-32px)] overflow-hidden">
      {/* Users */}
      <div className="border border-gray-300 rounded shadow p-4 w-[30%] overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.pk}
            onClick={() => selectUser(user)}
            className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
              selectedUser?.pk === user.pk ? "bg-gray-100" : ""
            }`}
          >
            <img
              src={BASEURL + user.profile}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />

            <p className="ml-4">{user.username}</p>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="border border-gray-300 rounded shadow w-[69%] ml-2 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b border-gray-300 p-4 shrink-0">
          {selectedUser ? (
            <div className="flex items-center">
              <img
                src={BASEURL + selectedUser.profile}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full object-cover"
              />

              <p className="ml-3 font-semibold">{selectedUser.username}</p>
            </div>
          ) : (
            <p className="text-gray-500">Select a user to start chatting</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => {
            const isMine = message.sender.pk === currentUserId;

            return (
              <div
                key={index}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="border-t border-gray-300 p-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gray-500"
            />

            <button
              className="bg-blue-500 text-white px-5 rounded-lg hover:bg-blue-600"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
