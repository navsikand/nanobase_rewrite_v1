"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { DexieDB } from "@/db";
import { dexie_syncPageWithServer } from "@/helpers/dexieHelpers";
import {
  fetchImageByName,
  getAllImageNamesFetcher,
  getAllStructureFilesFetcher,
  getStructureByIdFetcher,
  getStructureOxdnaFilesFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/16/solid";
import { useLiveQuery } from "dexie-react-hooks";
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

  const dexieData = useLiveQuery(() =>
    DexieDB.structurePageData.get(structureId)
  );

  const [structureData, setStructureData] =
    useState<STRUCTURE_CARD_DATA | null>(null);
  const [allStructureFiles, setAllStructureFiles] = useState<
    { name: string; url: string }[] | null
  >(null);
  const [allStructureImages, setAllStructureImages] = useState<string[] | null>(
    null
  );
  const [structureDataOxview, setStructureDataOxview] = useState<{
    files: File[];
    message: string;
  } | null>(null);

  useEffect(() => {
    if (dexieData) {
      setAllStructureFiles(
        dexieData.allStructureFiles.map((i) => {
          return {
            name: i.name,
            url: URL.createObjectURL(new File([i.data], i.name)),
          };
        })
      );
    }
  }, [dexieData]);

  useEffect(() => {
    if (dexieData) {
      setStructureData(dexieData.structureData);
    }
  }, [dexieData]);

  useEffect(() => {
    if (dexieData) {
      setAllStructureImages(
        dexieData.allStructureImages.map((i) =>
          i.size === 0 ? "/images/no-structure-img.png" : URL.createObjectURL(i)
        )
      );
    }
  }, [dexieData]);

  useEffect(() => {
    if (dexieData) {
      const set: {
        files: File[];
        message: string;
      } = { files: [], message: "drop" };

      dexieData.structureDataOxview.map((i) => {
        set.files.push(new File([i.data], i.name));
      });

      setStructureDataOxview(set);
    }
  }, [dexieData]);

  const [imageToDisplayIndex, setImageToDisplayIndex] = useState(0);

  const [haveSubmittedOxViewFile, setHaveSubmittedOxViewFile] = useState(false);

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
    if (oxviewIframeRef.current && structureDataOxview) {
      oxviewIframeRef.current.contentWindow?.postMessage(
        structureDataOxview,
        "*"
      );
      setHaveSubmittedOxViewFile(true);
    }
  }, [structureDataOxview]);

  useEffect(() => {
    if (!haveSubmittedOxViewFile) {
      sendToIframe();
    }
  }, [haveSubmittedOxViewFile, sendToIframe]);

  const { data: server_allStructureFiles } = useSWR(
    structureId ? ["getAllStructureFiles", structureId] : null,
    ([key, id]) => getAllStructureFilesFetcher(key, id)
  );

  const { data: server_fetchedStructureDataOxView } = useSWR(
    structureId ? ["getStructureOxdnaFiles", structureId] : null,
    ([key, id]) => getStructureOxdnaFilesFetcher(key, id)
  );

  const { data: server_structureData } = useSWR(
    structureId ? ["getStructureById", structureId] : null,
    ([key, id]) => getStructureByIdFetcher(key, id)
  );

  const { data: server_imageNames } = useSWR(
    structureId ? `getAllStructureImagesPaths-${structureId}` : null,
    getAllImageNamesFetcher(structureId)
  );

  const { data: server_allStructureImages } = useSWR(
    server_imageNames && structureId
      ? `getAllStructureImages-${structureId}`
      : null,
    async () => {
      if (!server_imageNames) return []; // Early return if no images
      const allImages = await Promise.all(
        server_imageNames.map((imageName) =>
          fetchImageByName(imageName, structureId)
        )
      );
      return allImages;
    }
  );

  useEffect(() => {
    if (
      server_allStructureFiles &&
      server_allStructureImages &&
      server_structureData &&
      server_fetchedStructureDataOxView
    ) {
      (async () => {
        await dexie_syncPageWithServer({
          allStructureFiles: server_allStructureFiles,
          allStructureImages: server_allStructureImages,
          flatStructureIdPage: structureId,
          structureData: server_structureData,
          structureDataOxview: server_fetchedStructureDataOxView,
        });
      })();
    }
  }, [
    server_allStructureFiles,
    server_allStructureImages,
    server_fetchedStructureDataOxView,
    server_structureData,
    structureId,
  ]);

  return (
    <div className="flex flex-col w-11/12 mx-auto justify-center items-center mt-20 lg:w-[65%] ">
      <h1 className="text-6xl font-bold">{structureData?.structure.title}</h1>

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
                {structureData?.structure.applications.map((application, i) =>
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
