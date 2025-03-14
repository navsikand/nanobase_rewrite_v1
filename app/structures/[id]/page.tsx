"use client";

import { DexieDB } from "@/db";
import { dexie_syncPageWithServer } from "@/helpers/dexieHelpers";
import {
  apiRoot,
  fetchAllStructureFiles,
  fetchAllStructureImages,
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
import { use, useCallback, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";

export default function StructurePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id: structureId } = use(params);

  const oxviewIframeRef = useRef<HTMLIFrameElement | null>(null);

  const dexieData = useLiveQuery(() =>
    DexieDB.structurePageData.get(structureId)
  );

  const [structureData, setStructureData] =
    useState<STRUCTURE_CARD_DATA | null>(null);
  const [allStructureFiles, setAllStructureFiles] = useState<
    { fileName: string; description: string }[] | null
  >(null);
  const [allStructureImages, setAllStructureImages] = useState<
    { imageName: string; description: string }[] | null
  >(null);
  const [structureDataOxview, setStructureDataOxview] = useState<{
    files: File[];
    message: string;
  } | null>(null);

  useEffect(() => {
    if (dexieData) {
      setStructureData(dexieData.structureData);
      setAllStructureFiles(
        dexieData.structureData.structure.fileNameToDescRelation
      );
      setAllStructureImages(
        dexieData.structureData.structure.imageNameToDescRelation
      );
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
  }, [haveSubmittedOxViewFile, sendToIframe, structureDataOxview]);

  const { data: server_allStructureFiles } = useSWR(
    structureId ? `getAllStructureFiles-${structureId}` : null,
    () => fetchAllStructureFiles(structureId)
  );

  const { data: server_allStructureImages } = useSWR(
    structureId ? `getAllStructureImages-${structureId}` : null,
    () => fetchAllStructureImages(structureId)
  );

  const { data: server_fetchedStructureDataOxView } = useSWR(
    structureId ? ["getStructureOxdnaFiles", structureId] : null,
    ([key, id]) => getStructureOxdnaFilesFetcher(key, id)
  );

  const { data: server_structureData } = useSWR(
    structureId ? ["getStructureById", structureId] : null,
    ([key, id]) => getStructureByIdFetcher(key, id)
  );

  useEffect(() => {
    if (server_fetchedStructureDataOxView) {
      const oxviewSet = { files: [] as File[], message: "drop" };
      server_fetchedStructureDataOxView.forEach((i) => {
        oxviewSet.files.push(new File([i.data], i.name));
      });
      setStructureDataOxview(oxviewSet);
    }
  }, [server_fetchedStructureDataOxView]);

  useEffect(() => {
    if (server_structureData) {
      dexie_syncPageWithServer({
        structureData: server_structureData,
        allStructureFiles: server_allStructureFiles || [],
        flatStructureIdPage: structureId,
      });
    }
  }, [
    server_structureData,
    server_allStructureFiles,
    server_allStructureImages,
    structureId,
  ]);

  return (
    <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* TabGroup for structure images */}
          <TabGroup className="flex flex-col-reverse">
            <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {allStructureImages ? (
                  allStructureImages.map((image) => (
                    <Tab
                      key={image.imageName}
                      className="group relative flex h-24 bg-white/30"
                    >
                      <span className="sr-only">{image.imageName}</span>
                      <span className="absolute inset-0 overflow-hidden rounded-md cursor-pointer border-2 border-gray-100">
                        <Image
                          alt="structure_image"
                          fill={true}
                          src={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${image.imageName}`}
                          className="size-full object-contain"
                        />
                      </span>
                    </Tab>
                  ))
                ) : (
                  <Skeleton height={96} />
                )}
              </TabList>
            </div>

            <TabPanels>
              {allStructureImages ? (
                allStructureImages?.map((image) => (
                  <TabPanel
                    as="div"
                    className={"w-full flex bg-white/30 rounded-xl"}
                    key={image.imageName}
                  >
                    <div className="relative h-full w-full min-h-60 aspect-square mx-auto flex-1">
                      <Image
                        alt={image.imageName}
                        src={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${image.imageName}`}
                        fill={true}
                        className="aspect-square w-full object-contain sm:rounded-lg"
                      />
                    </div>
                  </TabPanel>
                ))
              ) : (
                <Skeleton height={95} />
              )}
            </TabPanels>
          </TabGroup>

          {/* Product Info Section */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {structureData?.structure.title || <Skeleton />}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">Details</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="space-y-6 text-base text-gray-700">
                {structureData?.structure.description || <Skeleton count={3} />}
              </p>
            </div>

            {/* Additional details */}
            <section aria-labelledby="details-heading" className="mt-6">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <iframe
                src="https://sulcgroup.github.io/oxdna-viewer/"
                ref={oxviewIframeRef}
                onLoad={sendToIframe}
                className="w-full mx-auto aspect-[16/9] border-2 border-gray-100 mb-8"
              />

              <div className="divide-y divide-gray-200">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Images
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    <ul role="list" className="text-sm text-gray-700">
                      {dexieData &&
                      dexieData.structureData.structure
                        .imageNameToDescRelation ? (
                        allStructureImages?.map((file) => (
                          <li key={file.imageName} className="pl-2">
                            <Link
                              href={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${file.imageName}`}
                            >
                              {file.imageName}{" "}
                              <span className="text-gray-500">
                                {file.description}
                              </span>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <Skeleton count={3} />
                      )}
                    </ul>
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Files
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    <ul role="list" className="text-sm text-gray-700">
                      {allStructureFiles ? (
                        allStructureFiles.map((file) => (
                          <li key={file.fileName} className="pl-2">
                            <Link
                              href={`${apiRoot}/structure/files/${structureData?.flatStructureId}/structure/${file.fileName}`}
                            >
                              {file.fileName}{" "}
                              <span className="text-gray-500">
                                {file.description}
                              </span>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <Skeleton count={3} />
                      )}
                    </ul>
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Keywords
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData ? (
                      structureData.structure.keywords.join(" | ")
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Application
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData ? (
                      structureData.structure.applications.join(" | ")
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full items-center justify-between pt-6 text-left cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Authors
                      </span>
                      <span className="ml-6 flex items-center">
                        <PlusIcon
                          aria-hidden="true"
                          className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                        />
                        <MinusIcon
                          aria-hidden="true"
                          className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pb-6">
                    {structureData ? (
                      structureData.structure.authors.join(" | ")
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
