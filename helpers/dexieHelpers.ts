import { DexieDB, StructurePageData } from "@/db";
import { STRUCTURE_CARD_DATA } from "@/types";

const deepEqual = <T>(obj1: T, obj2: T): boolean => {
  // Check if both values are identical
  if (obj1 === obj2) return true;

  if (
    obj1 == null ||
    obj2 == null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1) as (keyof typeof obj1)[];
  const keys2 = Object.keys(obj2) as (keyof typeof obj2)[];
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

// TODO: Add pako support so compress the data before its stored
export const dexie_syncDexieWithServer = async (
  server_data: (STRUCTURE_CARD_DATA & { image: Blob })[]
) => {
  const noMatchesFoundIndexes = [];
  for (let i = 0; i < server_data.length; i++) {
    const current_server_data = server_data[i];

    const dexieCounterPart = await DexieDB.structures.get(
      current_server_data.flatStructureId
    );
    if (!dexieCounterPart) {
      noMatchesFoundIndexes.push(i);
    } else {
      if (
        current_server_data.structure.lastUpdated !==
          dexieCounterPart.structure.lastUpdated ||
        !deepEqual(current_server_data.structure, dexieCounterPart.structure)
      ) {
        await DexieDB.structures.delete(dexieCounterPart.flatStructureId);
        await DexieDB.structures.add(current_server_data);
      }
    }
  }

  for (let i = 0; i < noMatchesFoundIndexes.length; i++) {
    const index = noMatchesFoundIndexes[i];

    const current_server_data = server_data[index];
    DexieDB.structures.add({ ...current_server_data });
  }
};

export const dexie_getAllStructureCardData = async () => {
  return await DexieDB.structures.toArray();
};

export const enum SEARCH_BY {
  TITLE = "Title",
  AUTHOR = "Author",
  APPLICATION = "Application",
  KEYWORD = "Keyword",
  DESCRIPTION = "Description",
}

export const dexie_getAllStructureCardDataPaginated = async (
  skipLots: number,
  searchQuery: string,
  searchType: SEARCH_BY,
  take: number = 15
) => {
  const data = (await DexieDB.structures.toArray())
    .filter((dataToCheck) => {
      if (searchQuery === "") {
        return true;
      } else {
        switch (searchType) {
          case SEARCH_BY.APPLICATION:
            return false;

          case SEARCH_BY.AUTHOR: {
            let doesInclude = false;
            dataToCheck.structure.authors.forEach((author) => {
              if (author.toLowerCase().includes(searchQuery.toLowerCase())) {
                doesInclude = true;
              }
            });
            return doesInclude;
          }

          case SEARCH_BY.DESCRIPTION:
            return dataToCheck.structure.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          case SEARCH_BY.KEYWORD: {
            const splitup = searchQuery.toLowerCase().split(" ");
            const allMatch = splitup.every((queryWord) =>
              dataToCheck.structure.keywords.some((keyword) =>
                keyword.toLowerCase().includes(queryWord)
              )
            );

            return allMatch;
          }

          case SEARCH_BY.TITLE:
            return dataToCheck.structure.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          default:
            return false;
        }
      }
    })
    .sort((a, b) =>
      new Date(a.structure.uploadDate) < new Date(b.structure.uploadDate)
        ? 1
        : -1
    );

  const result: (STRUCTURE_CARD_DATA & { image: Blob })[][] = [];

  for (let i = 0; i < data.length; i += take) {
    result.push(data.slice(i, i + take));
  }

  return result[skipLots];
};

export const dexie_syncPageWithServer = async (
  server_data: StructurePageData
) => {
  const dexieCounterPart = await DexieDB.structures.get(
    server_data.flatStructureIdPage
  );

  if (dexieCounterPart) {
    if (
      dexieCounterPart.structure.lastUpdated !==
      server_data.structureData.structure.lastUpdated
    ) {
      await DexieDB.structurePageData.delete(server_data.flatStructureIdPage);
      await DexieDB.structurePageData.add(server_data);
    }
  } else {
    await DexieDB.structurePageData.add(server_data);
  }
};

export const dexie_getLatestStructure = async () => {
  const allStructures = await DexieDB.structures
    .orderBy("structure.uploadDate")
    .reverse()
    .limit(1)
    .toArray();
  return allStructures[0];
};
