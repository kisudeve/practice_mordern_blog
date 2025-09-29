import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../stores/authStore";

export default function ProtectedRoute() {
  const claims = useAuthStore((state) => state.claims);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();
  if (isLoading) return null; // ✅ 초기화 끝날 때까지 대기
  if (!claims)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
