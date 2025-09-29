import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../stores/authStore";

export default function PublicOnlyRoute() {
  const claims = useAuthStore((state) => state.claims);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  if (isLoading) return null; // ✅ 초기화 끝날 때까지 대기
  if (claims) {
    // 이미 로그인 상태면 홈이나 되돌아가야 할 곳으로
    const to = location.state?.from?.pathname ?? "/";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
