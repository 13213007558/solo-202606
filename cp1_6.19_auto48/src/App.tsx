import React from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

const App = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("admin");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/");
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/exhibition/:id" element={<ExhibitionDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
