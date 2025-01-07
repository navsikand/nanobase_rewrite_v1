"use client";

import { StructureCard } from "@/components/home/StructureCard";
import { DexieDB } from "@/db";
import { dexie_syncDexieWithServer } from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcher,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Input, Select } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Browse() {
  const [cardsToDisplay, setCardsToDisplay] = useState<
    (STRUCTURE_CARD_DATA & { image: string })[]
  >([]);

  const dexieData = useLiveQuery(() => DexieDB.structures.toArray());

  const [dexieDataWithImages, setDexieDataWithImages] = useState<
    (STRUCTURE_CARD_DATA & { image: string })[]
  >([]);

  useEffect(() => {
    if (dexieData && dexieData.length !== 0) {
      const sortedDexieData = dexieData.sort((a, b) =>
        new Date(a.structure.uploadDate) < new Date(b.structure.uploadDate)
          ? 1
          : -1
      );
      const ret: (STRUCTURE_CARD_DATA & { image: string })[] = [];

      sortedDexieData.map((i) => {
        ret.push({
          ...i,
          image:
            i.image.size === 0
              ? "/images/no-structure-img.png"
              : URL.createObjectURL(i.image),
        });
      });

      setDexieDataWithImages(ret);
    }
  }, [dexieData]);

  const enum SEARCH_BY {
    TITLE = "Title",
    AUTHOR = "Author",
    APPLICATION = "Application",
    KEYWORD = "Keyword",
    DESCRIPTION = "Description",
  }

  const serachByFields = [
    { id: 0, name: SEARCH_BY.TITLE },
    { id: 1, name: SEARCH_BY.AUTHOR },
    // { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 2, name: SEARCH_BY.KEYWORD },
    { id: 3, name: SEARCH_BY.DESCRIPTION },
  ];

  const [searchByParameter, setSearchByParameter] = useState<SEARCH_BY>(
    SEARCH_BY.TITLE
  );
  const [serachQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (dexieDataWithImages) {
      if (serachQuery === "") {
        setCardsToDisplay(dexieDataWithImages);
      } else {
        const filteredCards = dexieDataWithImages.filter((dataToCheck) => {
          switch (searchByParameter) {
            case SEARCH_BY.APPLICATION:
              return false;

            case SEARCH_BY.AUTHOR: {
              let doesInclude = false;
              dataToCheck.structure.authors.forEach((author) => {
                if (author.toLowerCase().includes(serachQuery.toLowerCase())) {
                  doesInclude = true;
                }
              });
              return doesInclude;
            }

            case SEARCH_BY.DESCRIPTION:
              return dataToCheck.structure.description
                .toLowerCase()
                .includes(serachQuery.toLowerCase());

            case SEARCH_BY.KEYWORD: {
              const splitup = serachQuery.toLowerCase().split(" ");
              // splitup.map((q) => {
              //   dataToCheck.structure.keywords.map((keyword) => {
              //     if (!keyword.toLowerCase().includes(q)) {
              //       return false;
              //     }
              //   });
              // });
              const allMatch = splitup.every((queryWord) =>
                dataToCheck.structure.keywords.some((keyword) =>
                  keyword.toLowerCase().includes(queryWord)
                )
              );

              return allMatch;
              return true;
            }

            case SEARCH_BY.TITLE:
              return dataToCheck.structure.title
                .toLowerCase()
                .includes(serachQuery.toLowerCase());

            default:
              return false;
          }
        });

        setCardsToDisplay(filteredCards);
      }
    }
  }, [
    SEARCH_BY.APPLICATION,
    SEARCH_BY.AUTHOR,
    SEARCH_BY.DESCRIPTION,
    SEARCH_BY.KEYWORD,
    SEARCH_BY.TITLE,
    dexieDataWithImages,
    searchByParameter,
    serachQuery,
  ]);

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
    <div className="mx-auto w-11/12">
      <div className="flex justify-center mb-2 space-x-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"bg-gray-400/20 rounded-xl p-2"}
          value={serachQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchByParameter(serachByFields[parseInt(e.target.value)].name)
          }
          className="rounded-lg"
        >
          {serachByFields.map((field) => (
            <option value={field.id} key={field.id}>
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {cardsToDisplay.map(
          ({ User, structure, isOld, image, flatStructureId }) => (
            <StructureCard
              flatStructureId={flatStructureId}
              User={User}
              isOld={isOld}
              structure={structure}
              key={structure.id}
              image={image}
            />
          )
        )}
      </div>
    </div>
  );
}
