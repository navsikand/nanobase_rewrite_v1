export interface OLD_DB_STRUCTURE {
  id: number;
  userId: number;
  title: string;
  type: string;
  description: string;
  size: number;
  publishDate: Date;
  citation: string;
  link: string;
  licensing: string;
  structureFiles: string;
  expProtocolFiles: string;
  expResultsFiles: string;
  simProtocolFiles: string;
  simResultsFiles: string;
  imageFiles: string;
  displayImage: string;
  structureDescriptions: string;
  expProtocolDescriptions: string;
  expResultsDescriptions: string;
  simProtocolDescriptions: string;
  simResultsDescriptions: string;
  statsData: string;
  imageDescriptions: string;
  private: boolean;
  uploadDate: Date;
  oxdnaFiles: string;
  privateHash: string;
}

export interface TEMP_STRUCTURE {
  id: number;
  title: string;
  type: string;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  uploadDate: Date;
  private: boolean;
  applications: string[];
  authors: string[];
  structureFilePaths: string[];
  expProtocolFilePaths: string[];
  expResultsFilesPaths: string[];
  simProtocolFilePaths: string[];
  simResultsFilePaths: string[];
  oxdnaFilePaths: string[];
  displayImageIndex: number;
  images: string[];
  statsData: JSON | null;
  userId: string;
  oldUserId: number | null;
  oldId: number;
}

export interface NEW_DB_STRUCTURE {
  id: number;
  userId: string;
  title: string;
  type:
    | "DNA"
    | "RNA"
    | "DNA RNA hybrid"
    | "Nucleic acid/protein hybrid"
    | string;
  description: string;
  size: number;
  datePublished: Date;
  citation: string;
  link: string;
  licensing: string;
  structureFilePaths: string[];
  expProtocolFilePaths: string[];
  expResultsFilesPaths: string[];
  simProtocolFilePaths: string[];
  simResultsFilePaths: string[];
  images: { description: string; path: string }[];
  displayImage: string;
  structureDescriptions: string; // ! WHAT?
  expProtocolDescriptions: string; // ! WHAT?
  expResultsDescriptions: string; // ! WHAT?
  simProtocolDescriptions: string; // ! WHAT?
  simResultsDescriptions: string;
  statsData: JSON;
  private: boolean;
  uploadDate: Date;
  oxdnaFilePaths: string[];
  privateHash: string;
}

export interface OLD_DB_USER {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  password: string;
  creationDate: string;
  administrator: boolean;
  privileged: boolean;
  verified: boolean;
  verifyCode: string;
  resetToken: string;
  resetTokenExpiration: number;
}
export interface NEW_DB_USER {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  // password: string;
  creationDate: string;
  administrator: boolean;
  privileged: boolean;
  verified: boolean;
  verifyCode: string;
  resetToken: string;
  resetTokenExpiration: number;
}

export interface DB_SCHEMA {
  applications: null;
  authors: null;
  jobs: null;
  keywords: null;
  modifications: null;
  structures: null;
  users: null;
}
