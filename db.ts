import Dexie, { EntityTable } from "dexie";
import { STRUCTURE_CARD_DATA } from "./types";

export interface StructurePageData {
  flatStructureIdPage: number;
  structureData: STRUCTURE_CARD_DATA;
  allStructureImages: string[];
  allStructureFiles: { name: string; url: string }[];
  structureDataOxview: { name: string; data: Blob }[];
}

const db = new Dexie("MyStructuresDatabase") as Dexie & {
  structures: EntityTable<
    STRUCTURE_CARD_DATA & { image: string },
    "flatStructureId"
  >;
  structurePageData: EntityTable<StructurePageData, "flatStructureIdPage">;
};

db.version(1).stores({
  structures:
    "flatStructureId, structure.title, structure.citation, structure.datePublished, structure.uploadDate, structure.paperLink, structure.oldId, User.firstName, User.lastName",
  structurePageData: "flatStructureIdPage",
});

export { db as DexieDB };
