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
import { STRUCTURE_CARD_DATA } from "@/db";
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
import { Fragment, use, useCallback, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";

// New component for file disclosures
interface FileDisclosureProps {
  title: string;
  files: { fileName: string; description: string }[];
  getHref: (file: { fileName: string; description: string }) => string;
}

function FileDisclosure({ title, files, getHref }: FileDisclosureProps) {
  return files.length > 0 ? (
    <div className="divide-y divide-gray-200 border-t">
      <Disclosure as="div">
        <h3>
          <DisclosureButton className="group relative flex w-full cursor-pointer items-center justify-between pt-6 text-left">
            <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
              {title}
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
            {files && files.length ? (
              files.map((file) => (
                <li key={file.fileName} className="pl-2">
                  <Link href={getHref(file)}>
                    {file.fileName}{" "}
                    <span className="text-gray-500">{file.description}</span>
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
  ) : (
    <></>
  );
}

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
  const [structureDataOxview, setStructureDataOxview] = useState<{
    files: File[];
    message: string;
  } | null>(null);

  useEffect(() => {
    if (dexieData) {
      setStructureData(dexieData.structureData);
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

  // Helper to zip together file names and descriptions
  const zipFiles = (
    files: string[] = [],
    descriptions: string[] = []
  ): { fileName: string; description: string }[] => {
    return files.map((file, idx) => ({
      fileName: file,
      description: descriptions[idx] || "",
    }));
  };

  // Create lists for each file type
  const expProtFiles = structureData
    ? zipFiles(
        structureData.structure.expProtFilesArr,
        structureData.structure.expProtDescriptionsArr
      )
    : [];
  const expResFiles = structureData
    ? zipFiles(
        structureData.structure.expResFilesArr,
        structureData.structure.expResDescriptionsArr
      )
    : [];
  const simProtFiles = structureData
    ? zipFiles(
        structureData.structure.simProtFilesArr,
        structureData.structure.simProtDescriptionsArr
      )
    : [];
  const simResFiles = structureData
    ? zipFiles(
        structureData.structure.simResFilesArr,
        structureData.structure.simResDescriptionsArr
      )
    : [];
  const structureFiles = structureData
    ? zipFiles(
        structureData.structure.structureFilesArr,
        structureData.structure.structureFileDescriptionsArr
      )
    : [];
  // Images list from schema (zip images and descriptions)
  const imageFiles = structureData
    ? zipFiles(
        structureData.structure.imagesArr,
        structureData.structure.imageDescriptionsArr
      )
    : [];

  return (
    <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* TabGroup for structure images */}
          <TabGroup className="flex flex-col-reverse">
            {/* Publication information */}
            <div className="mt-5 space-y-2">
              <div className="mt-3">
                <h2 className="text-2xl tracking-tight text-gray-900">
                  Publication information
                </h2>
              </div>
              <p>Citation: {structureData?.structure.citation}</p>
              <p>
                Date Published:{" "}
                {new Date(structureData?.structure.datePublished || "")
                  .toLocaleString()
                  .split(":")[0]
                  .substring(
                    0,
                    new Date(structureData?.structure.datePublished || "")
                      .toLocaleString()
                      .split(":")[0].length - 3
                  )}
              </p>
              <p>
                Licensing Information:{" "}
                {structureData?.structure.licensing || "N/A"}
              </p>

              <p>
                You may access the publication{" "}
                <Link
                  className="underline"
                  href={structureData?.structure.paperLink || ""}
                >
                  here
                </Link>
              </p>
            </div>

            <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {imageFiles ? (
                  imageFiles.map((image) => (
                    <Tab
                      key={image.fileName}
                      className="group relative flex h-24 bg-white/30"
                    >
                      <span className="sr-only">{image.fileName}</span>
                      <span className="absolute inset-0 cursor-pointer overflow-hidden rounded-md border-2 border-gray-100">
                        <Image
                          alt="structure_image"
                          fill={true}
                          src={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${image.fileName}`}
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
              {imageFiles ? (
                imageFiles.map((image) => (
                  <TabPanel
                    as="div"
                    className={"flex w-full rounded-xl bg-white/30"}
                    key={image.fileName}
                  >
                    <div className="relative mx-auto aspect-square h-full min-h-60 w-full flex-1">
                      <Image
                        alt={image.fileName}
                        src={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${image.fileName}`}
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

          {/* Info Section */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {structureData?.structure.title || <Skeleton />}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Structure information</h2>
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
                className="mx-auto mb-8 aspect-[16/9] w-full border-2 border-gray-100"
              />

              {/* Images Section */}
              <FileDisclosure
                title="Images"
                files={imageFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/images/${structureData?.flatStructureId}/${file.fileName}`
                }
              />

              {/* Experiment Protocol Files Section */}
              <FileDisclosure
                title="Experiment Protocol Files"
                files={expProtFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/files/${structureData?.flatStructureId}/expProt/${file.fileName}`
                }
              />

              {/* Experiment Result Files Section */}
              <FileDisclosure
                title="Experiment Result Files"
                files={expResFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/files/${structureData?.flatStructureId}/expRes/${file.fileName}`
                }
              />

              {/* Simulation Protocol Files Section */}
              <FileDisclosure
                title="Simulation Protocol Files"
                files={simProtFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/files/${structureData?.flatStructureId}/simProt/${file.fileName}`
                }
              />

              {/* Simulation Result Files Section */}
              <FileDisclosure
                title="Simulation Result Files"
                files={simResFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/files/${structureData?.flatStructureId}/simRes/${file.fileName}`
                }
              />

              {/* Structure Files Section */}
              <FileDisclosure
                title="Structure and Design Files"
                files={structureFiles}
                getHref={(file) =>
                  `${apiRoot}/structure/files/${structureData?.flatStructureId}/structure/${file.fileName}`
                }
              />

              {/* Keywords Section */}
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full cursor-pointer items-center justify-between pt-6 text-left">
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
                      <p>
                        {structureData.structure.keywords.map(
                          (keyword, idx, arr) => (
                            <Fragment key={keyword}>
                              <Link
                                href={`/browse?k=${encodeURIComponent(keyword)}`}
                              >
                                {keyword}
                              </Link>
                              {/* add separator except after the last one */}
                              {idx < arr.length - 1 && " | "}
                            </Fragment>
                          )
                        )}
                      </p>
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              {/* Applications Section */}
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full cursor-pointer items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Applications
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
                      <p>
                        {structureData.structure.applications.map(
                          (app, idx, arr) => (
                            <Fragment key={app}>
                              <Link
                                href={`/browse?ap=${encodeURIComponent(app)}`}
                              >
                                {app}
                              </Link>
                              {idx < arr.length - 1 && " | "}
                            </Fragment>
                          )
                        )}
                      </p>
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              {/* Authors Section */}
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full cursor-pointer items-center justify-between pt-6 text-left">
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
                      <p>
                        {structureData.structure.authors.map(
                          (author, idx, arr) => (
                            <Fragment key={author}>
                              <Link
                                href={`/browse?au=${encodeURIComponent(author)}`}
                              >
                                {author}
                              </Link>
                              {idx < arr.length - 1 && " | "}
                            </Fragment>
                          )
                        )}
                      </p>
                    ) : (
                      <Skeleton />
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              {/* Stats Section */}
              <div className="divide-y divide-gray-200 border-t">
                <Disclosure as="div">
                  <h3>
                    <DisclosureButton className="group relative flex w-full cursor-pointer items-center justify-between pt-6 text-left">
                      <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                        Stats
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
                      <>
                        <p>
                          Number of amino acids:{" "}
                          {structureData.structure.statsData?.total_a || "NaN"}
                        </p>
                        <p>
                          Number of nucleotides:{" "}
                          {structureData.structure.statsData?.total_n || "NaN"}
                        </p>
                        <p>
                          Number of staple strands:{" "}
                          {structureData.structure.statsData?.n_staples ||
                            "NaN"}
                        </p>
                        <p>
                          Number of peptide strands:{" "}
                          {structureData.structure.statsData?.n_peptides ||
                            "NaN"}
                        </p>
                        {structureData.structure.statsData?.graph && (
                          <div className="relative mx-auto aspect-square h-full min-h-60 w-full flex-1">
                            <p>Staple length distrubution:</p>
                            <Image
                              alt="Image"
                              src={`${apiRoot}/structure/images/${structureData?.flatStructureId}/${structureData.structure.statsData.graph}`}
                              fill={true}
                              className="aspect-square w-full object-contain sm:rounded-lg"
                            />
                          </div>
                        )}
                      </>
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
