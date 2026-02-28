import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useUser();

  // While we check auth status, don't render anything (optional: show a spinner)
  if (loading) return null;

  // If no user, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Otherwise render the protected component
  return children;
};

export default PrivateRoute;
