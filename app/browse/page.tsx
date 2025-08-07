"use client";

import { Suspense } from "react";
import BrowseInner from "./inner";
import { BrowsePageSkeleton } from "@/components/BrowsePageSkeleton";

export default function Browse() {
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseInner />
    </Suspense>
  );
}
