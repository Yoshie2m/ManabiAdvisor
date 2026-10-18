"use client";

import { useEffect } from "react";

import { useAcademyStore } from "@/stores/useAcademyStore";

// マウント時に一度だけ認証状態の監視を開始する。見た目を持たない。
export function AuthInitializer() {
  const initialize = useAcademyStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
