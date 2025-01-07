"use client";

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
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useLiveQuery } from "dexie-react-hooks";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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

  const [haveSubmittedOxViewFile, setHaveSubmittedOxViewFile] = useState(false);

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
    <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        {/* Product */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {allStructureImages ? (
                  allStructureImages.map((image) => (
                    <Tab
                      key={image}
                      className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-indigo-500/50 focus:ring-offset-4"
                    >
                      <span className="sr-only">{image}</span>
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        <Image
                          alt="structure_image"
                          fill={true}
                          src={image}
                          className="size-full object-cover"
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2 group-data-[selected]:ring-indigo-500"
                      />
                    </Tab>
                  ))
                ) : (
                  <Skeleton />
                )}
              </TabList>
            </div>

            <TabPanels>
              {allStructureImages?.map((image) => (
                <TabPanel as="div" className={"w-full flex"} key={image}>
                  <div className="relative h-full w-full min-h-60 aspect-square mx-auto flex-1">
                    <Image
                      alt={image}
                      src={image}
                      fill={true}
                      className="aspect-square w-full object-cover sm:rounded-lg"
                    />
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {structureData?.structure.title}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">Details</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <p className="space-y-6 text-base text-gray-700">
                {structureData?.structure.description}
              </p>
            </div>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Images
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    <ul role="list" className="text-sm/6 text-gray-700">
                      {allStructureImages?.map((file, i) => (
                        <li key={file} className="pl-2">
                          <Link href={file}>Image {i}</Link>
                        </li>
                      ))}
                    </ul>
                  </DisclosurePanel>
                </Disclosure>
              </div>
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Files
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    <ul role="list" className="text-sm/6 text-gray-700">
                      {allStructureFiles?.map((file) => (
                        <li key={file.url} className="pl-2">
                          <Link href={file.url}>{file.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </DisclosurePanel>
                </Disclosure>
              </div>
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Keywords
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData?.structure.keywords.map((keyword, i) =>
                      i < structureData.structure.keywords.length - 1
                        ? keyword + " | "
                        : keyword
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Application
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData?.structure.applications.map(
                      (application, i) =>
                        i < structureData.structure.applications.length - 1
                          ? application + " | "
                          : application
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Authors
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData?.structure.authors.map((author, i) =>
                      i < structureData.structure.authors.length - 1
                        ? author + " | "
                        : author
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>
              <iframe
                src="https://sulcgroup.github.io/oxdna-viewer/"
                ref={oxviewIframeRef}
                onLoad={() => sendToIframe()}
                className="w-full mx-auto aspect-[16/9] mt-20"
              />
              {/* <div className="divide-y divide-gray-200 border-t">
                {product.details.map((detail) => (
                  <Disclosure key={detail.name} as="div">
                    <h3>
                      <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                        <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                          {detail.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      <ul
                        role="list"
                        className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
                      >
                        {detail.items.map((item) => (
                          <li key={item} className="pl-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div> */}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
