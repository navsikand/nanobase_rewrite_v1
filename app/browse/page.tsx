"use client";

import { StructureCard } from "@/components/home/StructureCard";
import {
  dexie_getAllStructureCardDataPaginated,
  dexie_syncDexieWithServer,
  SEARCH_BY,
} from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcher,
  getAllPublicStructuresFetcherPaginated,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Button, Input, Select } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Browse() {
  const [pageNumber, setPageNumber] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SEARCH_BY>(SEARCH_BY.TITLE);
  const [cardsToDisplay, setCardsToDisplay] = useState<
    (STRUCTURE_CARD_DATA & { image: string })[]
  >([]);

  const serachByFields = [
    // ID number order does matter.
    { id: 0, name: SEARCH_BY.TITLE },
    { id: 1, name: SEARCH_BY.AUTHOR },
    // { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 2, name: SEARCH_BY.KEYWORD },
    { id: 3, name: SEARCH_BY.DESCRIPTION },
  ];

  const dexieData = useLiveQuery(
    () =>
      dexie_getAllStructureCardDataPaginated(
        pageNumber,
        searchQuery,
        searchType,
        setPageNumber
      ),
    [pageNumber, searchType, searchQuery]
  );

  useEffect(() => {
    if (
      dexieData &&
      dexieData.structures &&
      dexieData.structures.length !== 0
    ) {
      const ret: (STRUCTURE_CARD_DATA & { image: string })[] = [];
      dexieData.structures.map((i) => {
        ret.push({
          ...i,
          image: i.image === "" ? "/images/no-structure-img.webp" : i.image,
        });
      });
      setCardsToDisplay(ret);
    }
  }, [dexieData]);

  const { data: firstPageFetchedStructures } = useSWR(
    "getAllPublicStructures_paginated",
    getAllPublicStructuresFetcherPaginated
  );

  const { data: firstPageFetchedData } = useSWR(
    firstPageFetchedStructures ? "browse_first_getStructuresWithImages" : null,
    async () => {
      if (!firstPageFetchedStructures) return [];

      const structures = await Promise.all(
        firstPageFetchedStructures.map(async (structure) => {
          const structureId = structure.structure.id;
          try {
            const imageURL = structureId
              ? (await getStructureImageFetcher(structureId)).url
              : "";
            return { ...structure, image: imageURL };
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
    fetchedStructures ? "browse_all_getStructuresWithImages" : null,
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
    <div className="mx-auto w-11/12">
      <div className="flex justify-center mb-2 space-x-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"bg-white rounded-xl p-2 border-2 border-gray-100"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchType(serachByFields[parseInt(e.target.value)].name)
          }
          className="rounded-lg bg-white border-gray-100 border-2 cursor-pointer"
        >
          {serachByFields.map((field) => (
            <option
              value={field.id}
              key={field.id}
              className="bg-white/20 cursor-pointer"
            >
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {cardsToDisplay.map(({ User, structure, image, flatStructureId }) => (
          <StructureCard
            flatStructureId={flatStructureId}
            User={User}
            structure={structure}
            key={structure.id}
            image={image}
          />
        ))}
      </div>

      <div className={"flex justify-center mt-5"}>
        {Array.from({ length: dexieData?.count || 1 }, (_, i) => (
          <Button
            key={i}
            onClick={() => setPageNumber(i)}
            className={
              "p-5 rounded-lg hover:-translate-y-2 font-bold text-xl duration-100"
            }
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
