"use client";

import "react-loading-skeleton/dist/skeleton.css";

export default function TagPage({
  params: { tag },
}: {
  params: { tag: string };
}) {
  return <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8"></main>;
}
