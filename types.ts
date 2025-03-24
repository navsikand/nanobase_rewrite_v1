export type File = {
  description: string;
  data: Blob;
};

export interface Keywords {
  id: number;
  name: string;
  Structures: Structure[];
}

export enum StructureTypes {
  DNA = "DNA",
  RNA = "RNA",
  DNA_RNA_HYBRID = "DNA/RNA hybrid",
  NUCLEIC_ACID_PROTEIN_HYBRID = "Nucleic acid/protein hybrid",
}

export interface StatsData {
  [key: string]: string;
}

export type props_prisma_createStructure = {
  title: string;
  type: string | StructureTypes;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;

  applications: string[];
  authors: string[];

  displayImageIndex: number;
  images: FileList | null;
};

interface Structure {
  id: string;
  title: string;
  type: StructureTypes | string;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  uploadDate: Date;
  private: boolean;
  lasUpdated: Date;

  applications: string[];
  authors: string[];

  User?: local_User;
  userId: string;

  keywords: Keywords[];
}

interface local_User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  administrator: boolean;
  privileged: boolean;

  verified: boolean;
  verificationCode: string | null;
  verificationToken: string | null;
  createdAt: Date;

  instituitionName: string | null;

  Structures: Structure[];
}

export interface STRUCTURE_CARD_DATA {
  flatStructureId: number; // For dexie
  structure: {
    id: number;
    title: string;
    description: string;
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

    otherFiles: {
      fileName: string;
      description: string;
      type: string;
    }[];

    fileNameToDescRelation: {
      fileName: string;
      description: string;
    }[];

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
