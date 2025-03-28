import { DexieDB, StructurePageData } from "@/db";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Dispatch, SetStateAction } from "react";
import Fuse from "fuse.js";

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

export const dexie_syncDexieWithServer = async (
  server_data: (STRUCTURE_CARD_DATA & { image: string })[]
): Promise<void> => {
  try {
    // Create a map for fast lookups in the server data
    const serverDataMap = new Map(
      server_data.map((item) => [item.flatStructureId, item])
    );

    // Fetch all DexieDB records
    const dexieData = await DexieDB.structures.toArray();

    // Prepare lists for bulk operations
    const recordsToDelete: number[] = [];
    const recordsToUpdate: (STRUCTURE_CARD_DATA & { image: string })[] = [];
    const recordsToAdd: (STRUCTURE_CARD_DATA & { image: string })[] = [];

    // Start a DexieDB transaction
    await DexieDB.transaction("rw", DexieDB.structures, async () => {
      // Process existing DexieDB records
      for (const record of dexieData) {
        const serverRecord = serverDataMap.get(record.flatStructureId);

        if (!serverRecord) {
          // If no matching record in the server data, mark it for deletion
          recordsToDelete.push(record.flatStructureId);
        } else {
          // If the record exists but is outdated, mark it for update
          if (
            //record.structure.lastUpdated !==
            //  serverRecord.structure.lastUpdated ||
            !deepEqual(record, serverRecord)
          ) {
            recordsToUpdate.push(serverRecord);
          }
          // Remove from serverDataMap to avoid adding duplicates later
          serverDataMap.delete(record.flatStructureId);
        }
      }

      // Remaining records in serverDataMap are new and need to be added
      recordsToAdd.push(...Array.from(serverDataMap.values()));

      // Perform bulk operations
      if (recordsToDelete.length > 0) {
        await DexieDB.structures.bulkDelete(recordsToDelete);
      }
      if (recordsToUpdate.length > 0) {
        await DexieDB.structures.bulkPut(recordsToUpdate); // Use bulkPut for add or update
      }
      if (recordsToAdd.length > 0) {
        await DexieDB.structures.bulkAdd(recordsToAdd);
      }
    });
  } catch (error) {
    console.error("Error occurred while syncing Dexie with server:", error);
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
  setPageNumber: Dispatch<SetStateAction<number>>,
  take: number = 15
) => {
  const rawData = await DexieDB.structures.toArray();

  // Lowercase query for consistency
  const searchQueryLower = searchQuery.toLowerCase();

  // Fuzzy Search Configurations
  const fuseOptions = {
    threshold: 0.4, // Adjust based on fuzziness needs
    includeScore: false, // We only need matched results
  };

  // Create Fuse instances for different search types
  const fuseTitle = new Fuse(rawData, {
    ...fuseOptions,
    keys: ["structure.title"],
  });
  const fuseDescription = new Fuse(rawData, {
    ...fuseOptions,
    keys: ["structure.description"],
  });
  const fuseAuthors = new Fuse(rawData, {
    ...fuseOptions,
    keys: ["structure.authors"],
  });
  const fuseKeywords = new Fuse(rawData, {
    ...fuseOptions,
    keys: ["structure.keywords"],
  });

  const filteredData = rawData
    .filter((dataToCheck) => {
      if (searchQuery === "") {
        return true;
      }

      // Reset pagination
      setPageNumber(0);

      switch (searchType) {
        case SEARCH_BY.APPLICATION:
          return false;

        case SEARCH_BY.AUTHOR: {
          // Search authors using Fuse.js
          const results = fuseAuthors.search(searchQueryLower);
          return results.some((result) => result.item === dataToCheck);
        }

        case SEARCH_BY.DESCRIPTION: {
          // Search description using Fuse.js
          return fuseDescription
            .search(searchQueryLower)
            .some((result) => result.item === dataToCheck);
        }

        case SEARCH_BY.KEYWORD: {
          // Search keywords using Fuse.js
          return fuseKeywords
            .search(searchQueryLower)
            .some((result) => result.item === dataToCheck);
        }

        case SEARCH_BY.TITLE: {
          // Search title using Fuse.js
          return fuseTitle
            .search(searchQueryLower)
            .some((result) => result.item === dataToCheck);
        }

        default:
          return false;
      }
    })
    .sort((a, b) =>
      new Date(a.structure.uploadDate) < new Date(b.structure.uploadDate)
        ? 1
        : -1
    );

  const result: (STRUCTURE_CARD_DATA & { image: string })[][] = [];

  for (let i = 0; i < filteredData.length; i += take) {
    result.push(filteredData.slice(i, i + take));
  }

  return { structures: result[skipLots], count: result.length };
};

export const dexie_syncPageWithServer = async (
  server_data: StructurePageData
) => {
  try {
    // Fetch the existing record from DexieDB by its flatStructureIdPage
    const dexieCounterPart = await DexieDB.structurePageData.get(
      server_data.flatStructureIdPage
    );

    if (dexieCounterPart) {
      // Check if the data is outdated or different
      if (!deepEqual(dexieCounterPart, server_data)) {
        // Delete the old record and add the new one
        await DexieDB.structurePageData.delete(server_data.flatStructureIdPage);
        await DexieDB.structurePageData.add(server_data);
      }
    } else {
      // If no matching record exists, simply add the new data
      await DexieDB.structurePageData.add(server_data);
    }
  } catch (error) {
    console.error("Error occurred while syncing with server:", error);
  }
};

//export const dexie_syncPageWithServer = async (
//  server_data: StructurePageData
//) => {
//  const dexieCounterPart = await DexieDB.structurePageData.get(
//    server_data.flatStructureIdPage
//  );
//
//  if (dexieCounterPart) {
//    if (
//      //dexieCounterPart.structureData.structure.lastUpdated !==
//      //  server_data.structureData.structure.lastUpdated ||
//      !deepEqual(dexieCounterPart, server_data)
//    ) {
//      await DexieDB.structurePageData.delete(server_data.flatStructureIdPage);
//      await DexieDB.structurePageData.add(server_data);
//    }
//  } else {
//    await DexieDB.structurePageData.add(server_data);
//  }
//};

export const dexie_getLatestStructure = async () => {
  const allStructures = await DexieDB.structures
    .orderBy("structure.uploadDate")
    .reverse()
    .limit(1)
    .toArray();
  return allStructures[0];
};

export const dexie_getAllModifications = async () => {
  const structs = await DexieDB.structures.toArray();
  const mods = [];
  structs.map((i) => mods.push(i.structure.modifications));
};
