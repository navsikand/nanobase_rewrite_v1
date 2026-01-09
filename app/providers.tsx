"use client";

import { SWRConfig } from "swr";
import { defaultSWRConfig } from "@/lib/swrConfig";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={defaultSWRConfig}>
      {children}
    </SWRConfig>
  );
}
