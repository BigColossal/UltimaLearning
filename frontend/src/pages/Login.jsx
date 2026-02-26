import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    signup,
    loginWithGoogle,
    error: authError,
    loading,
  } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (isSignup && !name) {
      setError("Please enter your name");
      return;
    }

    const result = isSignup
      ? await signup(formData.email, formData.password, name)
      : await login(formData.email, formData.password);

    if (result.success) {
      navigate("/learning-hub");
    } else {
      setError(result.error || "Authentication failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate("/learning-hub");
    } else {
      setError(result.error || "Google login failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p>
            {isSignup
              ? "Join UltimaLearning to build your learning engine"
              : "Sign in to access your learning hub"}
          </p>
        </div>

        {(error || authError) && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login">
          <GoogleOAuthProvider
            clientId={import.meta.env.VITE_REACT_GOOGLE_CLIENT_ID || ""}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text={isSignup ? "signup_with" : "signin_with"}
            />
          </GoogleOAuthProvider>
        </div>

        <div className="login-footer">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="toggle-link"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
