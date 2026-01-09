"use client";

import { StructureCard } from "@/components/StructureCard";
import { DexieDB } from "@/db";
import { dexie_syncDexieWithServer } from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcherPaginated,
  batchGetStructureImages,
} from "@/helpers/fetchHelpers";
import { Button } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const INITIAL_PAGE_SIZE = 15;

export default function Home() {
  const router = useRouter();
  const [allStructuresLoaded, setAllStructuresLoaded] = useState(false);

  // Gets latest structure by upload date
  const latestDexieStructure = useLiveQuery(() =>
    DexieDB.structures
      .orderBy("structure.uploadDate")
      .reverse()
      .limit(1)
      .toArray()
      .then((s) => s[0])
  );

  // Gets total structure count
  const statsCount = useLiveQuery(() => DexieDB.structures.count());

  /**
   * Phase 1.3: Optimized Data Fetching
   * Changed from 4 concurrent API calls to 2:
   * - Single paginated structures fetch
   * - Batch image fetch for first page
   */

  // ✅ Single SWR call for first page (paginated)
  const { data: firstPageStructures } = useSWR(
    ["getAllPublicStructures_paginated", 0, INITIAL_PAGE_SIZE],
    ([_, skip, take]) =>
      getAllPublicStructuresFetcherPaginated("getAllPublicStructures_paginated", skip, take),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute dedup
    }
  );

  // ✅ Batch fetch images for first page only
  const { data: firstPageWithImages } = useSWR(
    firstPageStructures ? ["batchImages", firstPageStructures.map(s => s.structure.id)] : null,
    async ([_, ids]) => {
      if (!ids || ids.length === 0) return [];
      const imageMap = await batchGetStructureImages(ids as number[]);
      return (firstPageStructures || []).map(s => ({
        ...s,
        image: imageMap[s.structure.id] || ""
      }));
    }
  );

  // ✅ Single sync operation for first page
  useEffect(() => {
    if (firstPageWithImages?.length) {
      dexie_syncDexieWithServer(firstPageWithImages);
    }
  }, [firstPageWithImages]);

  // Get the latest structure - prefer from API data, fallback to Dexie
  const displayLatestStructure = firstPageWithImages?.[0] || latestDexieStructure;

  // ✅ Load remaining pages in background (only if needed)
  useEffect(() => {
    if (!allStructuresLoaded && statsCount && statsCount > INITIAL_PAGE_SIZE) {
      // Load remaining pages in background
      const loadRemaining = async () => {
        let skip = INITIAL_PAGE_SIZE;
        while (skip < (statsCount || 0)) {
          try {
            const batch = await getAllPublicStructuresFetcherPaginated(
              "getAllPublicStructures_paginated",
              skip,
              INITIAL_PAGE_SIZE
            );
            const ids = batch.map(s => s.structure.id);
            const imageMap = await batchGetStructureImages(ids);
            const withImages = batch.map(s => ({
              ...s,
              image: imageMap[s.structure.id] || ""
            }));
            await dexie_syncDexieWithServer(withImages);
            skip += INITIAL_PAGE_SIZE;
          } catch (error) {
            console.error("Error loading remaining pages:", error);
            break;
          }
        }
        setAllStructuresLoaded(true);
      };

      // Start loading in background after initial render
      const timeoutId = setTimeout(loadRemaining, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [statsCount, allStructuresLoaded]);

  return (
    <div className="mx-auto w-11/12 lg:w-[65%]">
      {/* Header text */}
      <div className="mt-5 flex flex-col items-center justify-center">
        <div className="relative flex w-screen flex-1 justify-center bg-[url(/images/banner-bg.webp)] bg-cover bg-repeat py-25">
          {/* White overlay */}
          <div className="absolute inset-0 z-0 bg-indigo-50 opacity-75"></div>

          {/* Content over the overlay */}
          <div className="relative z-10">
            <p className="text-xl md:-ml-6 md:text-3xl">Welcome to</p>
            <h1 className="text-5xl font-bold md:ml-6 md:text-7xl">
              Nanobase.org
            </h1>
          </div>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-2">
          <div>
            <h2 className="text-2xl">What is Nanobase?</h2>
            <p>
              Nanobase is a respository of DNA/RNA and protein nanostructures.
              It is a public resource for the bionanotechnology community to
              share and reuse their computational and experimental designs, with
              the goal of becoming RCSB PDB-like database and encouraging more
              collaboration and reusability of designs developed in our
              community. The structures already deposited have promising
              applications in fields like drug delivery, diagnostics, and
              nanophotonics.
            </p>
            <p className="mt-2">
              <b>
                Total structures:
                {` ${statsCount}`}
              </b>
            </p>

            <Button
              className={
                "relative mt-2 cursor-pointer rounded-lg bg-black px-5 py-2 text-lg font-semibold text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
              }
              onClick={() => router.push("/browse")}
            >
              Browse
            </Button>

            <Button
              className={
                "relative mt-2 ml-2 cursor-pointer rounded-lg bg-black px-5 py-2 text-lg font-semibold text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
              }
              onClick={() => router.push("/about-us")}
            >
              About us
            </Button>

            <p className="mt-3 text-sm">
              Have an account?{" "}
              <Link href="/sign-in" className="text-blue-800 underline">
                Sign in
              </Link>
            </p>
          </div>

          <div>
            <h2 className="text-2xl">Latest structure</h2>
            {displayLatestStructure && (
              <StructureCard
                User={displayLatestStructure.User}
                flatStructureId={displayLatestStructure.flatStructureId}
                image={displayLatestStructure.image || ""}
                structure={displayLatestStructure.structure}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
