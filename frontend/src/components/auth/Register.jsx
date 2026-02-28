import { useState } from "react";
import { useUser } from "../../context/UserContext";
import "../../styles/Auth.css";

const Register = ({ switchToLogin }) => {
  const { register } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await register(username, email, password);
      console.log("Registered! Access Token:", data.accessToken);
      // You can redirect or show a success message here
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card fade-in">
      <h1>Create Account</h1>

      <form onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Name"
          required
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <button className="btn btn-primary full-width">Sign Up</button>
      </form>

      <div className="auth-toggle">
        <p>Already have an account?</p>
        <button
          type="button"
          className="auth-switch-btn"
          onClick={switchToLogin}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
