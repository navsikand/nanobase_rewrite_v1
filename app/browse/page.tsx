"use client";

import { Suspense } from "react";
import BrowseInner from "./inner";

export default function Browse() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <BrowseInner />
    </Suspense>
  );
}
