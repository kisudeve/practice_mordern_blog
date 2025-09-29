import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import supabase from "../utils/supabase";

export default function AuthBootstrap() {
  const hydrateFromAuth = useAuthStore((s) => s.hydrateFromAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    // 앱 첫 로드: 현재 세션 기준으로 동기화
    hydrateFromAuth();

    // 세션 변화 감지
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrateFromAuth, clearAuth]);

  return null; // 부트스트랩용 무 UI 컴포넌트
}
