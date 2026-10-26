import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router";

export default function Register() {
  const defaultclasses =
    "mt-8 p-2 rounded shadow-sm w-full border hover:border-gray-200 focus:border-gray-400 outline-none ";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const submit = async () => {
    try {
      if (!username && !password) {
        setUsernameError("This field is required!");
        setPasswordError("This field is required!");
        return;
      }
      if (!username) {
        setUsernameError("This field is required!");
        return;
      }
      if (!password) {
        setPasswordError("This field is required!");
        return;
      }
      await api.post("users/create/", { username, password }, { headers: { Authorization: undefined, },});
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("access")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[90%] md:w-1/2 lg:w-1/3 p-6 border border-gray-300 rounded-xl shadow-lg">
        <div className="text-center">
          <h4 className="text-xl bold">Register</h4>
          <p className="text-sm text-gray-400">Register an account</p>
        </div>
        <input
          className={
            defaultclasses +
            (usernameError ? "border-red-400" : "border-gray-300")
          }
          placeholder="Username..."
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        {usernameError ? (
          <p className="text-red-400">{usernameError}</p>
        ) : (
          <></>
        )}
        <input
          className={
            defaultclasses +
            (passwordError ? "border-red-400" : "border-gray-300")
          }
          placeholder="Password..."
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        {passwordError ? (
          <p className="text-red-400">{passwordError}</p>
        ) : (
          <></>
        )}
        <button
          className="rounded bg-blue-500 mt-6 w-full p-2 text-white cursor-pointer"
          onClick={submit}
        >
          Submit
        </button>
        <p className="mt-8 text-sm text-gray-400">
          Already have an account?{" "}
          <Link className="text-blue-400" to={"/login"}>
            login
          </Link>
        </p>
      </div>
    </div>
  );
}