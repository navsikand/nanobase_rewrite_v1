"use client";

import { StructureCard } from "@/components/StructureCard";
import { DexieDB } from "@/db";
import { dexie_syncDexieWithServer } from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcher,
  getAllPublicStructuresFetcherPaginated,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { Button } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export default function Home() {
  const router = useRouter();

  // Gets latest structure by upload date
  const latestDexieStructure = useLiveQuery(() =>
    DexieDB.structures
      .orderBy("structure.uploadDate")
      .reverse()
      .limit(1)
      .toArray()
      .then((s) => s[0])
  );

  // Gets latest structure by upload date. Needs to be live query as on first load the value is always zero
  const statsCount = useLiveQuery(() => DexieDB.structures.count());

  const { data: firstPageFetchedStructures } = useSWR(
    "getAllPublicStructures_paginated",
    getAllPublicStructuresFetcherPaginated
  );

  const { data: firstPageFetchedData } = useSWR(
    firstPageFetchedStructures ? "getStructuresWithImages" : null,
    async () => {
      if (!firstPageFetchedStructures) return [];

      const structures = await Promise.all(
        firstPageFetchedStructures.map(async (structure) => {
          const structureId = structure.structure.id;
          try {
            const imageBlob = structureId
              ? (await getStructureImageFetcher(structureId)).url
              : "";
            return { ...structure, image: imageBlob };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...structure, image: "" };
          }
        })
      );
      return structures;
    }
  );

  useEffect(() => {
    (async () => {
      if (firstPageFetchedData)
        await dexie_syncDexieWithServer(firstPageFetchedData);
    })();
  }, [firstPageFetchedData]);

  const { data: fetchedStructures } = useSWR(
    "getAllPublicStructures",
    getAllPublicStructuresFetcher
  );

  const { data: fetchedData } = useSWR(
    fetchedStructures ? "getStructuresWithImages" : null,
    async () => {
      if (!fetchedStructures) return [];

      const structures = await Promise.all(
        fetchedStructures.map(async (structure) => {
          const structureId = structure.structure.id;
          try {
            const imageBlob = structureId
              ? (await getStructureImageFetcher(structureId)).url
              : "";
            return { ...structure, image: imageBlob };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...structure, image: "" };
          }
        })
      );
      return structures;
    }
  );

  useEffect(() => {
    (async () => {
      if (fetchedData) await dexie_syncDexieWithServer(fetchedData);
    })();
  }, [fetchedData]);

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
            {latestDexieStructure && (
              <StructureCard
                User={latestDexieStructure.User}
                flatStructureId={latestDexieStructure.flatStructureId}
                image={latestDexieStructure.image}
                structure={latestDexieStructure.structure}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
