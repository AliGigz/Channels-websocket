import { BrowserRouter, Routes, Route } from "react-router";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
