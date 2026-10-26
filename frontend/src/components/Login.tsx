import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router";

export default function Login() {
  const defaultclasses =
    "mt-8 p-2 rounded shadow-sm w-full border hover:border-gray-200 focus:border-gray-400 outline-none ";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();
  const submit = async () => {
    try {
      setHasError(false);
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
      const res = await api.post("token/generate/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/");
    } catch (error) {
      console.error(error);
      setHasError(true);
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
          <h4 className="text-xl bold">Login</h4>
          <p className="text-sm text-gray-400">Log in to your account</p>
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
        {hasError ? (
          <p className="mt-4 text-red-400 text-center">
            Username and Password didn't match!
          </p>
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
          Don't have an account?{" "}
          <Link className="text-blue-400" to={"/register"}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
