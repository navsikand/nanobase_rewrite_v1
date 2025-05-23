import { STRUCTURE_CARD_DATA } from "@/db";
import JSZip from "jszip";

export const apiRoot =
  process.env.NODE_ENV === "production"
    ? "https://api.nanobase.org/api/v1"
    : "http://localhost:3002/api/v1";
//export const apiRoot = "http://localhost:3002/api/v1";

export const getAllPublicStructuresFetcher = async (key: string) => {
  const response = await fetch(`${apiRoot}/structure/${key}`);
  const data = await response.json();
  return data.structures as STRUCTURE_CARD_DATA[];
};

export const getAllPublicStructuresFetcherPaginated = async (
  key: string,
  skip: number = 0,
  take: number = 15
) => {
  const response = await fetch(`${apiRoot}/structure/${key}`, {
    body: JSON.stringify({ skip, take }),
  });
  const data = await response.json();
  return data.structures as STRUCTURE_CARD_DATA[];
};

export const getStructureImageFetcher = async (
  structureId: number
): Promise<{ url: string }> => {
  const response = await fetch(
    `${apiRoot}/structure/structure-display-image?id=${structureId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch files for structure ${structureId}`);
  }
  const { url }: { url: string } = await response.json();
  const r = url === "" ? "" : `${apiRoot}/structure/images/${url}`;
  return { url: r };
};

export const getStructureOxdnaFilesFetcher = async (
  key: string,
  structureId: number
) => {
  const response = await fetch(`${apiRoot}/structure/${key}?id=${structureId}`);

  if (!response.ok) throw new Error("Failed to fetch oxdna files");

  const fileDataBlob = await response.blob();
  const zip = await JSZip.loadAsync(fileDataBlob);

  const files = await Promise.all(
    Object.keys(zip.files).map(async (fileName) => {
      const blob = await zip.files[fileName].async("blob");
      return { data: blob, name: fileName };
    })
  );
  return files || [];
};

export const getUserStructureByIdFetcher = async (
  key: string,
  structureId: number
): Promise<STRUCTURE_CARD_DATA> => {
  // Retrieve JWT from localStorage
  const token = localStorage.getItem("token");

  // Check if token exists, and throw an error if it's missing
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Make the fetch request with the Authorization header
  const response = await fetch(
    `${apiRoot}/structure/${key}?id=${structureId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch structure data");

  const fetchedStructure = await response.json();
  return fetchedStructure;
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch user profile");

  const profileData = await response.json();
  return profileData;
};

export const getAllUserStructuresFetcher = async (
  key: string
): Promise<STRUCTURE_CARD_DATA[]> => {
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch structures");

  const structures = await response.json();
  return structures.structures;
};

// Fetch helper for all structure files
export const fetchAllStructureFiles = async (
  structureId: number
): Promise<{ name: string; url: string }[]> => {
  const response = await fetch(
    `${apiRoot}/structure/structure-files?id=${structureId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch files for structure ${structureId}`);
  }
  const data = await response.json(); // Returns [{ name, url }]

  const r = data.map((d: { name: string; url: string }) => {
    return {
      name: d.name,
      url: d.url === "" ? "" : `${apiRoot}/structure/files/${d.url}`,
    };
  });
  return r;
};

// Fetch helper for image names
export const fetchAllImageNames = async (structureId: number) => {
  const response = await fetch(
    `${apiRoot}/structure/structure-images?id=${structureId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch image names for structure ${structureId}`);
  }
  const data = await response.json();
  const r = data.map((data: string) =>
    data === "" ? "" : `${apiRoot}/structure/images/${data}`
  );
  return r;
};

// Fetch all structure images as URLs
export const fetchAllStructureImages = async (structureId: number) => {
  const data = await fetchAllImageNames(structureId);
  return data;
};
