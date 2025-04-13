import Dexie, { EntityTable } from "dexie";

export interface STRUCTURE_CARD_DATA {
  flatStructureId: number; // For dexie
  structure: {
    id: number;
    title: string;
    description: string;
    modifications: string[];
    applications: string[];
    authors: string[];
    keywords: string[];
    citation: string;
    datePublished: string;
    type: string;
    licensing: string;
    uploadDate: string;
    paperLink: string;
    lastUpdated: string;
    private: boolean;

    // File arrays
    expResFilesArr: string[];
    imagesArr: string[];
    simProtFilesArr: string[];
    simResFilesArr: string[];
    structureFilesArr: string[];
    expProtFilesArr: string[];
    // Description arrays
    expProtDescriptionsArr: string[];
    expResDescriptionsArr: string[];
    imageDescriptionsArr: string[];
    simProtDescriptionsArr: string[];
    simResDescriptionsArr: string[];
    structureFileDescriptionsArr: string[];

    statsData?: {
      graph: string;
      total_a: number;
      total_n: number;
      n_staples: number;
      n_peptides: number;
    };
  };
  User: { firstName: string; lastName: string };
}

export interface StructurePageData {
  flatStructureIdPage: number;
  structureData: STRUCTURE_CARD_DATA;
  allStructureFiles: { name: string; url: string }[];
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
