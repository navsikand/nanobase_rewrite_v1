"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  fetchImageByName,
  getAllImageNamesFetcher,
  getAllStructureFilesFetcher,
  getStructureByIdFetcher,
  getStructureOxdnaFilesFetcher,
} from "@/helpers/fetchHelpers";
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
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

export default function StructurePage({
  params: { id: structureId },
}: {
  params: { id: number };
}) {
  const oxviewIframeRef = useRef<HTMLIFrameElement>(null);

  const { data: allStructureFiles } = useSWR(
    structureId ? ["getAllStructureFiles", structureId] : null,
    ([key, id]) => getAllStructureFilesFetcher(key, id)
  );

  const { data: fetchedStructureDataOxView, isLoading } = useSWR(
    structureId ? ["getStructureOxdnaFiles", structureId] : null,
    ([key, id]) => getStructureOxdnaFilesFetcher(key, id)
  );

  const { data: structureData } = useSWR(
    structureId ? ["getStructureById", structureId] : null,
    ([key, id]) => getStructureByIdFetcher(key, id)
  );

  const { data: imageNames } = useSWR(
    structureId ? `getAllStructureImagesPaths-${structureId}` : null,
    getAllImageNamesFetcher(structureId)
  );

  const { data: allStructureImages } = useSWR(
    imageNames && structureId
      ? `getAllStructureImages-${structureId}`
      : null,
    async () => {
      if (!imageNames) return []; // Early return if no images
      const allImages = await Promise.all(
        imageNames.map((imageName) =>
          fetchImageByName(imageName, structureId)
        )
      );
      return allImages;
    }
  );

  const [imageToDisplayIndex, setImageToDisplayIndex] = useState(0);

  const [haveSubmittedOxViewFile, setHaveSubmittedOxViewFile] =
    useState(false);

  const imageToDisplayIndexSetter = (n: number) => {
    if (allStructureImages)
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
  const sendToIframe = useCallback(() => {
    if (oxviewIframeRef.current && fetchedStructureDataOxView) {
      oxviewIframeRef.current.contentWindow?.postMessage(
        fetchedStructureDataOxView,
        "*"
      );
      setHaveSubmittedOxViewFile(true);
    }
  }, [fetchedStructureDataOxView]);

  useEffect(() => {
    if (!haveSubmittedOxViewFile) {
      sendToIframe();
    }
  }, [
    sendToIframe,
    fetchedStructureDataOxView,
    oxviewIframeRef,
    isLoading,
    haveSubmittedOxViewFile,
  ]);

  return (
    <div className="flex flex-col w-11/12 mx-auto justify-center items-center mt-20 lg:w-[65%] ">
      <h1 className="text-6xl font-bold">
        {structureData?.structure.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-8 w-full gap-2">
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
          onLoad={() => sendToIframe()}
          className="w-full h-full min-h-60"
        />
      </div>

      <div className="mt-12 w-full">
        <h2 className="text-4xl font-semibold">Images</h2>
        <div className="flex justify-center items-center">
          <button>
            <ArrowLeftCircleIcon
              className="size-14"
              onClick={() => imageToDisplayIndexSetter(-1)}
            />
          </button>
          <div className="w-full size-64 flex-1 relative">
            {allStructureImages ? (
              <Image
                src={allStructureImages[imageToDisplayIndex]}
                alt="structure_image"
                fill={true}
                className="object-contain"
              />
            ) : (
              <Skeleton />
            )}
          </div>
          <button>
            <ArrowRightCircleIcon
              className="size-14"
              onClick={() => imageToDisplayIndexSetter(1)}
            />
          </button>
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
              {allStructureImages ? (
                allStructureImages.map((image) => (
                  <div key={image}>
                    <Link href={image}>image</Link>
                  </div>
                ))
              ) : (
                <Skeleton />
              )}
            </TabPanel>

            <TabPanel>
              {allStructureFiles ? (
                allStructureFiles.map((file) => (
                  <div key={file.url}>
                    <Link href={file.url}>{file.name}</Link>
                  </div>
                ))
              ) : (
                <Skeleton />
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
