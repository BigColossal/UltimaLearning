import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import "../styles/Auth.css";

const AuthPage = () => {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-page">
      {mode === "login" ? (
        <Login switchToRegister={() => setMode("register")} />
      ) : (
        <Register switchToLogin={() => setMode("login")} />
      )}
    </div>
  );
};

export default AuthPage;
