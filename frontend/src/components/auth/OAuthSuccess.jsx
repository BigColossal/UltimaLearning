import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    // Fetch user from backend using ID
    fetch(`/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => loginWithGoogle(token, userData))
      .catch((err) => {
        console.error("OAuth login failed", err);
        navigate("/login");
      });
  }, [loginWithGoogle, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "10rem", color: "#ff7300" }}>
      Logging you in...
    </div>
  );
};

export default OAuthSuccess;
