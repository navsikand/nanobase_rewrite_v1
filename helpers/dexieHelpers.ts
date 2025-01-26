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
            record.structure.lastUpdated !==
              serverRecord.structure.lastUpdated ||
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

  const result: (STRUCTURE_CARD_DATA & { image: string })[][] = [];

  for (let i = 0; i < data.length; i += take) {
    result.push(data.slice(i, i + take));
  }

  return { structures: result[skipLots], count: result.length };
};

export const dexie_syncPageWithServer = async (
  server_data: StructurePageData
) => {
  const dexieCounterPart = await DexieDB.structurePageData.get(
    server_data.flatStructureIdPage
  );

  if (dexieCounterPart) {
    if (
      dexieCounterPart.structureData.structure.lastUpdated !==
        server_data.structureData.structure.lastUpdated ||
      !deepEqual(dexieCounterPart, server_data)
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
