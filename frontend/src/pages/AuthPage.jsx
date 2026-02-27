import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import "../styles/Auth.css";

export default function AuthPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        <form onSubmit={submitHandler}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary full-width">Login</button>
        </form>

        <div className="divider">OR</div>

        <a href="http://localhost:5000/api/auth/google" className="google-btn">
          Continue with Google
        </a>
      </div>
    </div>
  );
}
