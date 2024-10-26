"use client";

import { StructureCard } from "@/components/home/StructureCard";
import {
  getAllPublicStructuresFetcher,
  getStructureImageFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Input, Select } from "@headlessui/react";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function FreshBrowse() {
  const [cardsToDisplay, setCardsToDisplay] = useState<
    (STRUCTURE_CARD_DATA & { image: string })[]
  >([]);

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
            const imageUrl = structureId
              ? await getStructureImageFetcher(structureId)
              : "/";
            return { ...structure, image: imageUrl };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...structure, image: "/" };
          }
        })
      );
      return structures;
    }
  );

  enum SEARCH_BY {
    TITLE = "Title",
    AUTHOR = "Author",
    APPLICATION = "Application",
    KEYWORD = "Keyword",
    DESCRIPTION = "Description",
  }

  const serachByFields = [
    { id: 0, name: SEARCH_BY.TITLE },
    { id: 1, name: SEARCH_BY.AUTHOR },
    { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 3, name: SEARCH_BY.KEYWORD },
    { id: 4, name: SEARCH_BY.DESCRIPTION },
  ];

  const [searchByParameter, setSearchByParameter] = useState<SEARCH_BY>(
    SEARCH_BY.TITLE
  );
  const [serachQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (fetchedData) {
      if (serachQuery === "") {
        setCardsToDisplay(fetchedData);
      } else {
        const filteredCards = fetchedData.filter((dataToCheck) => {
          if (searchByParameter === SEARCH_BY.APPLICATION) {
          } else if (searchByParameter === SEARCH_BY.AUTHOR) {
            let doesInclude = false;
            dataToCheck.structure.authors.map((author) => {
              if (
                author.toLowerCase().includes(serachQuery.toLowerCase())
              ) {
                doesInclude = true;
              }
            });
            return doesInclude;
          } else if (searchByParameter === SEARCH_BY.DESCRIPTION) {
            return dataToCheck.structure.description
              .toLowerCase()
              .includes(serachQuery.toLowerCase());
          } else if (searchByParameter === SEARCH_BY.KEYWORD) {
            let doesInclude = false;
            dataToCheck.structure.keywords.map((keyword) => {
              if (
                keyword.toLowerCase().includes(serachQuery.toLowerCase())
              ) {
                doesInclude = true;
              }
            });
            return doesInclude;
          } else if (searchByParameter === SEARCH_BY.TITLE) {
            return dataToCheck.structure.title
              .toLowerCase()
              .includes(serachQuery.toLowerCase());
          }

          return false;
        });

        setCardsToDisplay(filteredCards);
      }
    }
  }, [
    fetchedData,
    serachQuery,
    searchByParameter,
    SEARCH_BY.APPLICATION,
    SEARCH_BY.AUTHOR,
    SEARCH_BY.DESCRIPTION,
    SEARCH_BY.KEYWORD,
    SEARCH_BY.TITLE,
  ]);

  return (
    <div className="mx-auto w-11/12">
      <div className="flex justify-center mb-2">
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
            setSearchByParameter(
              serachByFields[parseInt(e.target.value)].name
            )
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
        {cardsToDisplay.map(({ User, structure, isOld, image }) => (
          <StructureCard
            User={User}
            isOld={isOld}
            structure={structure}
            key={structure.id}
            image={image}
          />
        ))}
      </div>
    </div>
  );
}
