"use client";

import { STRUCTURE_CARD_DATA } from "@/types";
import JSZip from "jszip";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

export default function StructurePage({
  params: { id: structureId },
}: {
  params: { id: string };
}) {
  const oxviewIframeRef = useRef<HTMLIFrameElement>(null);

  const [fetchedStructureDataOxView, setFetchedStructureDataOxView] =
    useState<{
      files: File[];
      message: string;
    } | null>(null);

  const [structureData, setStructureData] =
    useState<STRUCTURE_CARD_DATA | null>(null);

  const [allStructureImages, setAllStructureImages] = useState<string[]>(
    []
  );

  const fetchAndSetOxViewFiles = useCallback(async () => {
    const retFiles: File[] = [];

    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/structure/getStructureOxdnaFiles?id=${structureId}`
      );
      const fileDataBlob = await response.blob();

      const zip = await JSZip.loadAsync(fileDataBlob);
      const theKeys = Object.keys(zip.files);

      for (let i = 0; i < theKeys.length; i++) {
        const key = theKeys[i];
        const file = zip.files[key];
        const blob = await file.async("blob");
        retFiles.push(new File([blob], key));
      }

      setFetchedStructureDataOxView({ files: retFiles, message: "drop" });
    } catch (error) {
      console.error("Error fetching or extracting ZIP file:", error);
    }
  }, [structureId]);

  const fetchAndSetStructureData = useCallback(async () => {
    const response = await fetch(
      `http://localhost:3002/api/v1/structure/getStructureById?id=${structureId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const fetchedStructure: STRUCTURE_CARD_DATA = await response.json();
    setStructureData(fetchedStructure);
  }, [structureId]);

  const fetchAndSetStructureImages = useCallback(async () => {
    const allImageNamesResponse = await fetch(
      `http://localhost:3002/api/v1/structure/getAllStructureImagesPaths?id=${structureId}`
    );

    const allImageNames: string[] = await allImageNamesResponse.json();
    const allImages: string[] = [];

    allImageNames.map(async (imageName) => {
      const response = await fetch(
        `http://localhost:3002/api/v1/structure/getStructureImageByName/${imageName}?id=${structureId}`
      );

      if (!response.ok) {
        throw new Error("Image not found");
      }
      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      allImages.push(imageObjectURL);
    });
    setAllStructureImages(allImages);
  }, [structureId]);

  useEffect(() => {
    if (structureId) {
      fetchAndSetOxViewFiles();
    }
  }, [structureId, fetchAndSetOxViewFiles]);

  useEffect(() => {
    if (structureId) {
      fetchAndSetStructureData();
    }
  }, [structureId, fetchAndSetStructureData]);

  useEffect(() => {
    if (structureId) {
      fetchAndSetStructureImages();
    }
  }, [structureId, fetchAndSetStructureImages]);

  useEffect(() => {
    if (oxviewIframeRef.current && fetchedStructureDataOxView) {
      oxviewIframeRef.current.contentWindow?.postMessage(
        fetchedStructureDataOxView,
        "*"
      );
    }
  }, [fetchedStructureDataOxView, oxviewIframeRef]);

  return (
    <div>
      <div className="grid grid-cols-2">
        <div>
          <p>
            <b>Description: </b>{" "}
            {JSON.stringify(structureData?.structure?.description)}
          </p>

          <p>
            <b>Structure Type: </b>{" "}
            {JSON.stringify(structureData?.structure?.type)}
          </p>

          <p>
            <b>Applications: </b>{" "}
            {JSON.stringify(structureData?.structure?.applications)}
          </p>

          <p>
            <b>Keywords: </b>{" "}
            {JSON.stringify(structureData?.structure?.keywords)}
          </p>
        </div>
        <iframe
          src="https://sulcgroup.github.io/oxdna-viewer/"
          ref={oxviewIframeRef}
          onLoad={() => fetchAndSetOxViewFiles()}
        />
      </div>
      <div>
        {allStructureImages.map((structureImage) => (
          <Image
            alt="hi"
            width={"200"}
            height={"200"}
            src={structureImage}
            key={structureImage}
          />
        ))}
      </div>
    </div>
  );
}
