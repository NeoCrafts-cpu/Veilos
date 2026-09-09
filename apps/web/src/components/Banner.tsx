import type { ReactNode } from "react";

type BannerTone = "error" | "info" | "ok";

export function Banner({ tone, children }: { tone: BannerTone; children: ReactNode }) {
  return (
    <p className={`banner ${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
