export type FilePath = {
  description: string;
  filePath: string;
  fileType: string;
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
  type: StructureTypes | string;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;

  applications: string[];
  authors: string[];

  structureFilePaths: FilePath[];
  expProtocolFilePaths: FilePath[];
  expResultsFilesPaths: FilePath[];
  simProtocolFilePaths: FilePath[];
  simResultsFilePaths: FilePath[];
  oxdnaFilePaths: FilePath[];

  displayImageIndex: number;
  images: FilePath[];

  statsData: StatsData;
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

  applications: string[];
  authors: string[];

  structureFilePaths: FilePath[];
  expProtocolFilePaths: FilePath[];
  expResultsFilesPaths: FilePath[];
  simProtocolFilePaths: FilePath[];
  simResultsFilePaths: FilePath[];
  oxdnaFilePaths: FilePath[];

  displayImageIndex: number;
  images: FilePath[];

  statsData: StatsData;

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
