import { useState } from "react";
import { useUser } from "../../context/UserContext";
import "../../styles/Auth.css";

const Login = ({ switchToRegister }) => {
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password); // now this actually resolves to the backend data
      console.log("Logged in!", data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="auth-card fade-in">
      <h1>Welcome Back</h1>

      <form onSubmit={submitHandler}>
        <input
          type="email"
          placeholder="Email"
          required
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn-primary full-width">Login</button>
      </form>

      <div className="divider">OR</div>

      <a href="http://localhost:5000/api/auth/google" className="google-btn">
        Continue with Google
      </a>

      <div className="auth-toggle">
        <p>Don't have an account?</p>
        <button
          type="button"
          className="auth-switch-btn"
          onClick={switchToRegister}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
