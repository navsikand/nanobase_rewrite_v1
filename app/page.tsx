"use client";

import { StructureCard } from "@/components/home/StructureCard";
import {
  dexie_getLatestStructure,
  dexie_syncDexieWithServer,
} from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcher,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Button } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Home() {
  const router = useRouter();

  const [latestStructureWithImage, setLatestStructureWithImage] = useState<
    (STRUCTURE_CARD_DATA & { image: string }) | null
  >(null);

  useEffect(() => {
    (async () => {
      const latestDexieStructure = await dexie_getLatestStructure();
      if (latestDexieStructure) {
        const imageUrl = URL.createObjectURL(latestDexieStructure.image);
        setLatestStructureWithImage({
          ...latestDexieStructure,
          image: imageUrl,
        });
      }
    })();
  }, []);

  const { data: fetchedStructures } = useSWR(
    "getAllPublicStructures_paginated",
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
              ? await getStructureImageFetcher(structureId)
              : new Blob();
            return { ...structure, image: imageBlob };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...structure, image: new Blob() };
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
      <div className="flex flex-col justify-center items-center mt-20 ">
        <div>
          <p className="text-2xl font-light -ml-6">Welcome to</p>
          <h1 className="ml-6 text-6xl font-bold">Nanobase</h1>
        </div>
        <div className="mt-12 grid gap-2 grid-cols-2">
          <div>
            <p>
              For over 40 years, nucleic acid nanotechnology has created
              diverse self-assembling DNA and RNA structures used in fields
              like drug delivery, diagnostics, and nanophotonics. Our
              platform offers a shared database of these designs, along
              with tools for editing, visualizing, and simulating them. By
              fostering collaboration, we aim to make verified
              nanostructures more accessible and reusable, enabling easy
              adaptation for research and practical applications. Users can
              also export ready-to-order strands or simulate designs on our
              oxDNA.org server, enhancing modularity and functionality
              across the community.
            </p>

            <Button
              className={
                "rounded-lg px-5 py-2 font-semibold text-lg bg-black text-white relative hover:-translate-y-1 hover:shadow-xl duration-200 mt-2"
              }
              onClick={() => router.push("/browse")}
            >
              Browse
            </Button>

            <p className="text-sm mt-3">
              Have an account?{" "}
              <Link href="/sign-in" className="underline text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
          <div>
            Latest structure
            {latestStructureWithImage && (
              <StructureCard
                User={latestStructureWithImage.User}
                flatStructureId={latestStructureWithImage.flatStructureId}
                image={latestStructureWithImage.image}
                isOld={latestStructureWithImage.isOld}
                structure={latestStructureWithImage.structure}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
