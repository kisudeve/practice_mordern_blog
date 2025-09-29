import { create } from "zustand";
import type { Claims } from "../types/user";
import supabase from "../utils/supabase";
import { devtools, persist } from "zustand/middleware";

type AuthStore = {
  isLoading: boolean;
  claims: Claims;
  setClaims: (c: Claims) => void;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  hydrateFromAuth: () => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        isLoading: true,
        claims: null,
        profile: null,
        setProfile: (profile: Profile | null) => set({ profile: profile }),
        setClaims: (c) => set({ claims: c }),
        clearAuth: () => set({ claims: null, profile: null }),
        hydrateFromAuth: async () => {
          set({ isLoading: true });

          // 1) 클레임 가져오기
          const { data: claimsData, error: claimsErr } =
            await supabase.auth.getClaims();

          if (claimsErr) {
            // 세션 없음 or 아직 초기화 전일 수 있음
            set({ claims: null, profile: null, isLoading: false });
            return;
          }

          // supabase-js v2의 getClaims() 응답 구조에 맞춰 추출
          const claims = (claimsData?.claims ?? claimsData) as Claims | null;
          set({ claims });

          // 2) 프로필 조회 (행이 있을 때만)
          if (claims?.sub) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", claims.sub)
              .maybeSingle();

            set({ profile: profileData ?? null });
          }

          set({ isLoading: false });
        },
      }),
      {
        name: "auth-store",
        partialize: (s) => ({ claims: s.claims, profile: s.profile }), // isLoading은 저장 X
      }
    )
  )
);
