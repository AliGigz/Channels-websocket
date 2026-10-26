import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./ProtectedRoute";
import { useNavigate } from "react-router";

export interface User {
  pk: number;
  username: string;
  profile: string;
  firstname: string;
  lastname: string;
}

export default function Profile() {
  const { currentUserId } = useAuth();
  const [user, setUser] = useState<User>();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const res = await api.get(`users/${currentUserId}/`);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const res = await api.patch(`users/${currentUserId}/update/`, {
        username,
        firstname,
        lastname,
      });

      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUser();
    console.log(user);
  }, [currentUserId]);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="h-screen p-6 overflow-hidden">
      <div className="max-w-5xl mx-auto h-full flex gap-6">
        <div className="w-1/2 border border-gray-300 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Profile</h2>

          <div className="flex flex-col items-center">
            <img
              src={user.profile}
              alt={user.username}
              className="w-32 h-32 rounded-full object-cover border"
            />

            <h3 className="text-2xl font-semibold mt-4">
              {user.firstname} {user.lastname}
            </h3>

            <p className="text-gray-500">@{user.username}</p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <p className="text-sm text-gray-500">First name</p>
              <p className="font-medium">
                {user.firstname ? user.firstname : "Empty"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Last name</p>
              <p className="font-medium">
                {user.lastname ? user.lastname : "Empty"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="w-1/2 border border-gray-300 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                First name
              </label>

              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last name
              </label>

              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gray-500"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition cursor-pointer"
            >
              Save Changes
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition mt-2 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
