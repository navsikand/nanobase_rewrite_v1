"use client";

import { STRUCTURE_CARD_DATA } from "@/types";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/16/solid";
import JSZip from "jszip";
import Image from "next/image";
import Link from "next/link";
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

  const [allStructureFiles, setAllStructureFiles] = useState<
    { name: string; url: string }[]
  >([]);

  const [structureData, setStructureData] =
    useState<STRUCTURE_CARD_DATA | null>(null);

  const [allStructureImages, setAllStructureImages] = useState<string[]>(
    []
  );

  const [imageToDisplayIndex, setImageToDisplayIndex] = useState(0);

  const imageToDisplayIndexSetter = (n: number) => {
    if (n === 1) {
      if (imageToDisplayIndex !== allStructureImages.length - 1) {
        setImageToDisplayIndex(imageToDisplayIndex + 1);
      } else {
        setImageToDisplayIndex(0);
      }
    } else {
      if (imageToDisplayIndex !== 0) {
        setImageToDisplayIndex(imageToDisplayIndex - 1);
      } else {
        setImageToDisplayIndex(allStructureImages.length - 1);
      }
    }
  };

  const fetchAndSetAllStructureFiles = useCallback(async () => {
    const retFiles: { name: string; url: string }[] = [];

    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/structure/getAllStructureFiles?id=${structureId}`
      );
      const fileDataBlob = await response.blob();

      const zip = await JSZip.loadAsync(fileDataBlob);
      const theKeys = Object.keys(zip.files);

      for (let i = 0; i < theKeys.length; i++) {
        const key = theKeys[i];
        const file = zip.files[key];
        const blob = await file.async("blob");
        const fileObjectURL = URL.createObjectURL(blob);

        retFiles.push({ name: key, url: fileObjectURL });
      }

      setAllStructureFiles(retFiles);
    } catch (error) {
      console.error("Error fetching or extracting ZIP file:", error);
    }
  }, [structureId]);

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
      fetchAndSetAllStructureFiles();
    }
  }, [structureId, fetchAndSetAllStructureFiles]);

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
    <div className="flex flex-col w-11/12 mx-auto justify-center items-center mt-20 lg:w-[65%] ">
      <h1 className="text-6xl font-bold">
        {structureData?.structure.title}
      </h1>

      <div className="grid grid-cols-2 mt-8 w-full gap-2">
        <div className="w-full">
          <h2 className="text-4xl font-semibold">Details</h2>
          <div className="space-y-2 mt-3">
            <div>
              <p>
                <b>Description:</b> {structureData?.structure.description}
              </p>
            </div>

            <div>
              <p>
                <b>Keywords:</b>{" "}
                {structureData?.structure.keywords.map((keyword, i) =>
                  i < structureData.structure.keywords.length - 1
                    ? keyword + " | "
                    : keyword
                )}
              </p>
            </div>

            <div>
              <p>
                <b>Authors:</b>{" "}
                {structureData?.structure.authors.map((author, i) =>
                  i < structureData.structure.authors.length - 1
                    ? author + " | "
                    : author
                )}
              </p>
            </div>

            <div>
              <p>
                <b>Applications:</b>{" "}
                {structureData?.structure.applications.map(
                  (application, i) =>
                    i < structureData.structure.applications.length - 1
                      ? application + " | "
                      : application
                )}
              </p>
            </div>
          </div>
        </div>
        <iframe
          src="https://sulcgroup.github.io/oxdna-viewer/"
          ref={oxviewIframeRef}
          onLoad={() => fetchAndSetOxViewFiles()}
          className="w-full"
        />
      </div>

      <div className="mt-12 w-full">
        <h2 className="text-4xl font-semibold">Images</h2>
        <div className="flex justify-center items-center">
          <ArrowLeftCircleIcon
            className="size-14"
            onClick={() => imageToDisplayIndexSetter(-1)}
          />
          <div className="w-full size-64 flex-1 relative">
            <Image
              src={allStructureImages[imageToDisplayIndex]}
              alt="structure_image"
              fill={true}
              className="object-contain"
            />
          </div>

          <ArrowRightCircleIcon
            className="size-14"
            onClick={() => imageToDisplayIndexSetter(1)}
          />
        </div>
      </div>

      <div className="mt-12 w-full">
        <h2 className="text-4xl font-semibold">Files</h2>

        <TabGroup>
          <TabList className={"space-x-3"}>
            <Tab
              className={`bg-indigo-300/10 data-[selected]:bg-indigo-300/50 rounded-lg p-2`}
            >
              Image files
            </Tab>
            <Tab
              className={`bg-indigo-300/10 data-[selected]:bg-indigo-300/50 rounded-lg p-2`}
            >
              Structure files
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {allStructureImages.map((image) => (
                <div key={image}>
                  <Link href={image}>image</Link>
                </div>
              ))}
            </TabPanel>

            <TabPanel>
              {allStructureFiles.map((file) => (
                <div key={file.url}>
                  <Link href={file.url}>{file.name}</Link>
                </div>
              ))}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
