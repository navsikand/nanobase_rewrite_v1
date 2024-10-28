import Dexie, { EntityTable } from "dexie";
import { STRUCTURE_CARD_DATA } from "./types";



export interface StructurePageData {
  flatStructureIdPage: number;
  structureData: STRUCTURE_CARD_DATA;
  allStructureImages: Blob[];
  allStructureFiles: { name: string, data: Blob }[]
  structureDataOxview: { name: string, data: Blob }[]
}

const db = new Dexie("MyStructuresDatabase") as Dexie & {
  structures: EntityTable<STRUCTURE_CARD_DATA & { image: Blob }, "flatStructureId">;
  structurePageData: EntityTable<StructurePageData, "flatStructureIdPage">
};

db.version(1).stores({
  structures: "flatStructureId, structure.title, structure.citation, structure.datePublished, structure.uploadDate, structure.paperLink, structure.oldId, User.firstName, User.lastName",
  structurePageDatas: "flatStructureIdPage"
});

export { db as DexieDB };



