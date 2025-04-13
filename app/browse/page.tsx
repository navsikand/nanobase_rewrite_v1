"use client";

import { StructureCard } from "@/components/StructureCard";
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
import { STRUCTURE_CARD_DATA } from "@/db";
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
      <div className="mb-2 flex justify-center space-x-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"rounded-xl border-2 border-gray-100 bg-white p-2"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchType(serachByFields[parseInt(e.target.value)].name)
          }
          className="cursor-pointer rounded-lg border-2 border-gray-100 bg-white"
        >
          {serachByFields.map((field) => (
            <option
              value={field.id}
              key={field.id}
              className="cursor-pointer bg-white/20"
            >
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

      <div className={"mt-5 flex justify-center"}>
        {(() => {
          const totalPages = dexieData?.count || 1;
          const current = pageNumber;
          let pagesToShow = [];

          if (totalPages <= 7) {
            // For few pages, simply show all.
            pagesToShow = Array.from({ length: totalPages }, (_, i) => i);
          } else {
            // Always show first page.
            pagesToShow.push(0);

            // Calculate the dynamic range: current page ±2.
            let left = current - 2;
            let right = current + 2;

            // Adjust the range if near the beginning.
            if (left <= 1) {
              left = 1;
              right = 4;
            }
            // Adjust the range if near the end.
            if (right >= totalPages - 1) {
              right = totalPages - 2;
              left = totalPages - 5;
            }

            // Insert ellipsis if there's a gap after the first page.
            if (left > 1) {
              pagesToShow.push("ellipsis-left");
            }

            // Add dynamic middle pages.
            for (let i = left; i <= right; i++) {
              pagesToShow.push(i);
            }

            // Insert ellipsis if there's a gap before the last page.
            if (right < totalPages - 2) {
              pagesToShow.push("ellipsis-right");
            }

            // Always show last page.
            pagesToShow.push(totalPages - 1);
          }

          return pagesToShow.map((item, i) => {
            if (typeof item === "string") {
              return (
                <span key={item + i} className="p-5 text-xl font-bold">
                  ...
                </span>
              );
            } else {
              return (
                <Button
                  key={item}
                  onClick={() => setPageNumber(item)}
                  className={`cursor-pointer rounded-lg p-5 text-xl font-bold duration-100 hover:-translate-y-2 ${
                    pageNumber === item ? "underline" : ""
                  }`}
                >
                  {item + 1}
                </Button>
              );
            }
          });
        })()}
      </div>
    </div>
  );
}
