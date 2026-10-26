import { Link } from "react-router";
import { useAuth } from "./AuthProvider";
import { useEffect } from "react";

export default function Navbar() {
  const { currentUserId } = useAuth()
  useEffect(() => {}, [currentUserId]);
  return (
    <div className="flex p-4 border-bottom shadow-sm">
      <h4 className="bold text-2xl">Channels</h4>
      <div className="ml-auto">
        {currentUserId ? (
          <>
          <Link className="hover:text-blue-500 cursor-pointer mr-2" to="/">
            Home
          </Link>
          <Link className="hover:text-blue-500 cursor-pointer" to="/profile">
            Profile
          </Link>
          </>
        ) : (
          <Link className="hover:text-blue-500 cursor-pointer" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
