import { DexieDB, StructurePageData } from "@/db";
import { STRUCTURE_CARD_DATA } from "@/types";

export const dexie_syncDexieWithServer = async (server_data: (STRUCTURE_CARD_DATA & { image: Blob })[]) => {
  const noMatchesFoundIndexes = []
  for (let i = 0; i < server_data.length; i++) {
    const current_server_data = server_data[i];

    const dexieCounterPart = await DexieDB.structures.get(current_server_data.flatStructureId);
    if (!dexieCounterPart) {
      noMatchesFoundIndexes.push(i)
    } else {
      if (current_server_data.structure.lastUpdated !== dexieCounterPart.structure.lastUpdated) {
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
}

export const dexie_getAllStructureCardData = async () => {
  return await DexieDB.structures.toArray()
}

export const dexie_syncPageWithServer = async (server_data: StructurePageData) => {
  const dexieCounterPart = await DexieDB.structures.get(server_data.flatStructureIdPage);

  if (dexieCounterPart) {
    if (dexieCounterPart.structure.lastUpdated !== server_data.structureData.structure.lastUpdated) {
      await DexieDB.structurePageData.delete(server_data.flatStructureIdPage)
      await DexieDB.structurePageData.add(server_data)
    }
  } else {
    await DexieDB.structurePageData.add(server_data)
  }
}

export const dexie_getLatestStructure = async () => {
  const allStructures = await DexieDB.structures
    .orderBy("structure.uploadDate")
    .limit(1)
    .toArray();
  return allStructures[0];
};