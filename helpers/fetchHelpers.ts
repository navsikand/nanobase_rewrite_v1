import { STRUCTURE_CARD_DATA } from "@/types";
import JSZip from "jszip";


export const apiRoot = process.env.NODE_ENV === 'production'
  ? "https://api.nanobase.org/api/v1"
  : "http://localhost:3002/api/v1";

export const getAllPublicStructuresFetcher = async (key: string) => {
  const response = await fetch(`${apiRoot}/structure/${key}`);
  const data = await response.json();
  return data.structures as STRUCTURE_CARD_DATA[];
};

export const getStructureImageFetcher = async (structureId: number) => {
  const response = await fetch(
    `${apiRoot}/structure/getStructureDisplayImage?id=${structureId}`
  );

  if (!response.ok) throw new Error("Image fetch failed");

  return await response.blob();
};

export const getAllStructureFilesFetcher = async (
  key: string,
  structureId: number
) => {
  const response = await fetch(
    `${apiRoot}/structure/${key}?id=${structureId}`
  );

  if (!response.ok) throw new Error("Failed to fetch structure files");

  const fileDataBlob = await response.blob();
  const zip = await JSZip.loadAsync(fileDataBlob);

  const files = await Promise.all(
    Object.keys(zip.files).map(async (fileName) => {
      const fileBlob = await zip.files[fileName].async("blob");
      return { name: fileName, data: fileBlob };
    })
  );

  return files;
};

export const getStructureOxdnaFilesFetcher = async (
  key: string,
  structureId: number
) => {
  const response = await fetch(
    `${apiRoot}/structure/${key}?id=${structureId}`
  );

  if (!response.ok) throw new Error("Failed to fetch oxdna files");

  const fileDataBlob = await response.blob();
  const zip = await JSZip.loadAsync(fileDataBlob);

  const files = await Promise.all(
    Object.keys(zip.files).map(async (fileName) => {
      const blob = await zip.files[fileName].async("blob");
      return { data: blob, name: fileName };
    })
  );

  return files
};

export const getStructureByIdFetcher = async (
  key: string,
  structureId: number
) => {
  const response = await fetch(
    `${apiRoot}/structure/${key}?id=${structureId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch structure data");

  const fetchedStructure: STRUCTURE_CARD_DATA = await response.json();
  return fetchedStructure;
};

export const getAllImageNamesFetcher =
  (structureId: number) => async () => {
    const response = await fetch(
      `${apiRoot}/structure/getAllStructureImagesPaths?id=${structureId}`
    );
    if (!response.ok) throw new Error("Failed to fetch image paths");
    const allImageNames = await response.json();
    return allImageNames as string[];
  };

export const fetchImageByName = async (
  imageName: string,
  structureId: number
) => {
  const response = await fetch(
    `${apiRoot}/structure/getStructureImageByName/${imageName}?id=${structureId}`
  );
  if (!response.ok) throw new Error("Image not found");
  const imageBlob = await response.blob();
  return imageBlob
};


export const getUserProfileFetcher = async (key: string) => {

  // Retrieve JWT from localStorage
  const token = localStorage.getItem("token");

  // Check if token exists, and throw an error if it's missing
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Make the fetch request with the Authorization header
  const response = await fetch(`${apiRoot}/auth/${key}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) throw new Error("Failed to fetch user profile");

  const profileData = await response.json();
  return profileData;
};

export const getAllUserStructuresFetcher = async (key: string): Promise<STRUCTURE_CARD_DATA[]> => {

  // Retrieve JWT from localStorage
  const token = localStorage.getItem("token");

  // Check if token exists, and throw an error if it's missing
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Make the fetch request with the Authorization header
  const response = await fetch(`${apiRoot}/structure/${key}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) throw new Error("Failed to fetch structures");

  const structures = await response.json();
  return structures.structures;
};
