"use client";

import { StructureCard } from "@/components/home/StructureCard";
import { DexieDB } from "@/db";
import { dexie_syncDexieWithServer } from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcher,
  getAllPublicStructuresFetcherPaginated,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Button } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Home() {
  const router = useRouter();

  const latestDexieStructure = useLiveQuery(() =>
    DexieDB.structures
      .orderBy("structure.uploadDate")
      .reverse()
      .limit(1)
      .toArray()
  );

  const statsCount = useLiveQuery(() => DexieDB.structures.count());

  const [latestStructureWithImage, setLatestStructureWithImage] = useState<
    (STRUCTURE_CARD_DATA & { image: string }) | null
  >(null);

  useEffect(() => {
    (async () => {
      if (latestDexieStructure && latestDexieStructure[0]) {
        const latest = latestDexieStructure[0];

        const imageUrl =
          latest.image === "" ? "/images/no-structure-img.webp" : latest.image;
        setLatestStructureWithImage({
          ...latest,
          image: imageUrl,
        });
      }
    })();
  }, [latestDexieStructure]);

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
    <div className="w-11/12 mx-auto lg:w-[65%] ">
      {/* Header text */}
      <div className="flex flex-col justify-center items-center mt-20">
        <div>
          <p className="text-xl  md:text-3xl font-light md:-ml-6">Welcome to</p>
          <h1 className="md:ml-6 md:text-7xl text-5xl font-bold">Nanobase</h1>
        </div>
        <div className="mt-12 grid gap-2 md:grid-cols-2">
          <div>
            <h2 className="text-2xl">What is Nanobase?</h2>
            <p>
              Nanobase is a respository of DNA/RNA and protein structures used
              in fields like drug delivery, diagnostics, and nanophotonics.
            </p>
            <p className="mt-2">
              <b>
                Total structures:
                {` ${statsCount}`}
              </b>
            </p>

            <Button
              className={
                "rounded-lg px-5 py-2 font-semibold text-lg bg-black text-white relative hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer mt-2"
              }
              onClick={() => router.push("/browse")}
            >
              Browse
            </Button>

            <Button
              className={
                "rounded-lg px-5 py-2 font-semibold text-lg bg-black text-white relative hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer mt-2 ml-2"
              }
              onClick={() => router.push("/about-us")}
            >
              About us
            </Button>

            <p className="text-sm mt-3">
              Have an account?{" "}
              <Link href="/sign-in" className="underline text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Latest structure</h2>
            {latestStructureWithImage && (
              <StructureCard
                User={latestStructureWithImage.User}
                flatStructureId={latestStructureWithImage.flatStructureId}
                image={latestStructureWithImage.image}
                structure={latestStructureWithImage.structure}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
