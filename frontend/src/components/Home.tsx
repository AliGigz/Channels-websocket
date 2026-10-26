import { useEffect, useState, useRef } from "react";
import api from "../api";
import { type User } from "./Profile";
import { getProfileImageUrl } from "./utils";
import { useAuth } from "./AuthProvider";

interface Message {
  sender: User;
  reciever: User;
  content: string;
}

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [searchUsername, setSearchUsername] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const { currentUserId } = useAuth();

  const getSearchedUsers = async () => {
    if (!searchUsername.trim()) {
      setSearchedUsers([]);
      return;
    }

    try {
      const res = await api.get("users/search/", {
        params: {
          username: searchUsername.trim(),
        },
      });

      setSearchedUsers(res.data);
      setIsSearching(true);
    } catch (error) {
      console.log(error);
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setSearchUsername("");
    setSearchedUsers([]);
  };

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

    if (socketRef.current) {
      socketRef.current.close();
    }

    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${user.pk}/?token=${token}`,
    );

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

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex mx-8 mt-4 h-[calc(100vh-32px)] overflow-hidden">
      <div className="border border-gray-300 rounded shadow p-4 w-[30%] overflow-y-auto">
        <div className="flex mb-4 gap-1">
          <input
            type="text"
            placeholder="Search username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                getSearchedUsers();
              }
            }}
            className="p-2 border border-gray-300 rounded shadow-sm flex-1 outline-none focus:border-gray-400"
          />

          {isSearching ? (
            <button
              onClick={cancelSearch}
              className="rounded bg-red-500 px-3 text-white cursor-pointer hover:bg-red-600"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={getSearchedUsers}
              className="rounded bg-blue-500 px-3 text-white cursor-pointer hover:bg-blue-600"
            >
              Search
            </button>
          )}
        </div>

        {isSearching ? (
          searchedUsers.length > 0 ? (
            searchedUsers.map((user) => (
              <div
                key={user.pk}
                onClick={() => selectUser(user)}
                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedUser?.pk === user.pk ? "bg-gray-100" : ""
                }`}
              >
                <img
                  src={getProfileImageUrl(user.profile)}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <p className="ml-4">{user.username}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-4">No users found</p>
          )
        ) : (
          users.map((user) => (
            <div
              key={user.pk}
              onClick={() => selectUser(user)}
              className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedUser?.pk === user.pk ? "bg-gray-100" : ""
              }`}
            >
              <img
                src={getProfileImageUrl(user.profile)}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />

              <p className="ml-4">{user.username}</p>
            </div>
          ))
        )}
      </div>

      <div className="border border-gray-300 rounded shadow w-[69%] ml-2 flex flex-col min-h-0">
        <div className="border-b border-gray-300 p-4 shrink-0">
          {selectedUser ? (
            <div className="flex items-center">
              <img
                src={getProfileImageUrl(selectedUser.profile)}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full object-cover"
              />

              <p className="ml-3 font-semibold">{selectedUser.username}</p>
            </div>
          ) : (
            <p className="text-gray-500">Select a user to start chatting</p>
          )}
        </div>

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

        {selectedUser && (
          <div className="border-t border-gray-300 p-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
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
