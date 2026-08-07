import { useAuthStore } from "../store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  console.log(isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute