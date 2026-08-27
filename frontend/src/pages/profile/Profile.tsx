import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  if (user?.role === "CLIENT") return <Navigate replace to="/profile/client" />;
  if (user?.role === "FREELANCER") return <Navigate replace to="/profile/freelancer" />;
  return <Navigate replace to="/dashboard" />;
}
