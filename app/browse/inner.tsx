"use client";
import { StructureCard } from "@/components/StructureCard";
import {
  dexie_getAllStructureCardDataPaginated,
  dexie_syncDexieWithServer,
  dexie_syncDexieWithServer_backgroundMode,
  SEARCH_BY,
} from "@/helpers/dexieHelpers";
import {
  getAllPublicStructuresFetcherPaginated,
  getPublicStructureCountFetcher,
  batchGetStructureImages,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/db";
import { Button, Input, Select } from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";

export default function Browse() {
  const searchParams = useSearchParams();
  const s_keyword = searchParams.get("k");
  const s_author = searchParams.get("au");
  const s_application = searchParams.get("ap");

  const [pageNumber, setPageNumber] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SEARCH_BY>(SEARCH_BY.TITLE);
  const [cardsToDisplay, setCardsToDisplay] = useState<
    (STRUCTURE_CARD_DATA & { image: string })[]
  >([]);

  const serachByFields = [
    // ID number order does matter.
    { id: 0, name: SEARCH_BY.TITLE },
    { id: 1, name: SEARCH_BY.AUTHOR },
    { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 3, name: SEARCH_BY.KEYWORD },
    { id: 4, name: SEARCH_BY.DESCRIPTION },
  ];

  const dexieData = useLiveQuery(
    () =>
      dexie_getAllStructureCardDataPaginated(
        pageNumber,
        15, // pageSize
        searchQuery,
        searchType
      ),
    [pageNumber, searchType, searchQuery]
  );

  useEffect(() => {
    if (s_keyword) {
      setSearchType(SEARCH_BY.KEYWORD);
      setSearchQuery(s_keyword);
    }

    if (s_author) {
      setSearchType(SEARCH_BY.AUTHOR);
      setSearchQuery(s_author);
    }

    if (s_application) {
      setSearchType(SEARCH_BY.APPLICATION);
      setSearchQuery(s_application);
    }
  }, [s_keyword, s_author, s_application]);

  useEffect(() => {
    setPageNumber(0);
  }, [searchQuery, searchType]);

  useEffect(() => {
    if (
      dexieData &&
      dexieData.structures &&
      dexieData.structures.length !== 0
    ) {
      const ret: (STRUCTURE_CARD_DATA & { image: string })[] = [];
      dexieData.structures.map((i) => {
        ret.push({
          ...i,
          image: i.image === "" ? "/images/no-structure-img.webp" : i.image,
        });
      });
      setCardsToDisplay(ret);
    }
  }, [dexieData]);

  // Get total structure count from API for correct pagination
  const { data: totalCount } = useSWR(
    "public_structure_count",
    getPublicStructureCountFetcher,
    {
      dedupingInterval: 3600000, // 1 hour
      revalidateOnFocus: false,
    }
  );

  // Track loading progress
  const [loadingStatus, setLoadingStatus] = useState<{
    stage: "idle" | "first-page" | "background" | "complete";
    loaded: number;
    total: number;
  }>({ stage: "idle", loaded: 0, total: 0 });

  // Unified data loading - single source of truth
  useEffect(() => {
    if (!totalCount) return;

    const abortController = new AbortController();
    let isActive = true;

    const loadAllData = async () => {
      try {
        // PHASE 1: Load first page FAST
        setLoadingStatus({ stage: "first-page", loaded: 0, total: totalCount });

        const firstPage = await getAllPublicStructuresFetcherPaginated(
          "getAllPublicStructures_paginated",
          0,
          15
        );

        // Batch fetch images for first page (15 IDs in 1 request)
        const firstPageIds = firstPage
          .map((s) => s.structure.id)
          .filter(Boolean) as number[];

        const imageMap = await batchGetStructureImages(firstPageIds);

        const firstPageWithImages = firstPage.map((s) => ({
          ...s,
          image: imageMap[s.structure.id] || "",
        }));

        await dexie_syncDexieWithServer(firstPageWithImages);
        setLoadingStatus({ stage: "first-page", loaded: 15, total: totalCount });

        // Wait 1 second before background loading
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!isActive || abortController.signal.aborted) return;

        // PHASE 2: Load remaining in batches of 100
        if (totalCount <= 15) {
          setLoadingStatus({
            stage: "complete",
            loaded: totalCount,
            total: totalCount,
          });
          return;
        }

        setLoadingStatus({ stage: "background", loaded: 15, total: totalCount });

        const BATCH_SIZE = 100;
        let skip = 15;

        while (skip < totalCount && isActive && !abortController.signal.aborted) {
          // Fetch batch of structures
          const batch = await getAllPublicStructuresFetcherPaginated(
            "getAllPublicStructures_paginated",
            skip,
            BATCH_SIZE
          );

          if (!isActive || abortController.signal.aborted) break;

          // Batch fetch images (max 100 IDs at once - perfect match!)
          const batchIds = batch
            .map((s) => s.structure.id)
            .filter(Boolean) as number[];

          const batchImageMap = await batchGetStructureImages(batchIds);

          const batchWithImages = batch.map((s) => ({
            ...s,
            image: batchImageMap[s.structure.id] || "",
          }));

          await dexie_syncDexieWithServer_backgroundMode(batchWithImages);

          skip += BATCH_SIZE;
          setLoadingStatus({
            stage: "background",
            loaded: Math.min(skip, totalCount),
            total: totalCount,
          });

          // Small delay to avoid overwhelming server
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (isActive && !abortController.signal.aborted) {
          setLoadingStatus({
            stage: "complete",
            loaded: totalCount,
            total: totalCount,
          });
        }
      } catch (error) {
        console.error("Error loading structures:", error);
      }
    };

    loadAllData();

    // Cleanup on unmount
    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [totalCount]);

  return (
    <div className="mx-auto w-11/12">
      <div className="mb-2 flex justify-center space-x-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"rounded-xl border-2 border-gray-100 bg-white p-2"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchType(serachByFields[parseInt(e.target.value)].name)
          }
          value={serachByFields
            .findIndex((field) => field.name === searchType)
            .toString()}
          className="cursor-pointer rounded-lg border-2 border-gray-100 bg-white"
        >
          {serachByFields.map((field) => (
            <option
              value={field.id}
              key={field.id}
              className="cursor-pointer bg-white/20"
            >
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cardsToDisplay.map(({ User, structure, image, flatStructureId }) => (
          <StructureCard
            flatStructureId={flatStructureId}
            User={User}
            structure={structure}
            key={structure.id}
            image={image}
          />
        ))}
      </div>

      <div className={"mt-5 flex justify-center"}>
        {(() => {
          const totalPages = dexieData?.totalPages || 1;
          const current = pageNumber;
          let pagesToShow = [];

          if (totalPages <= 7) {
            // For few pages, simply show all.
            pagesToShow = Array.from({ length: totalPages }, (_, i) => i);
          } else {
            // Always show first page.
            pagesToShow.push(0);

            // Calculate the dynamic range: current page ±2.
            let left = current - 2;
            let right = current + 2;

            // Adjust the range if near the beginning.
            if (left <= 1) {
              left = 1;
              right = 4;
            }
            // Adjust the range if near the end.
            if (right >= totalPages - 1) {
              right = totalPages - 2;
              left = totalPages - 5;
            }

            // Insert ellipsis if there's a gap after the first page.
            if (left > 1) {
              pagesToShow.push("ellipsis-left");
            }

            // Add dynamic middle pages.
            for (let i = left; i <= right; i++) {
              pagesToShow.push(i);
            }

            // Insert ellipsis if there's a gap before the last page.
            if (right < totalPages - 2) {
              pagesToShow.push("ellipsis-right");
            }

            // Always show last page.
            pagesToShow.push(totalPages - 1);
          }

          return pagesToShow.map((item, i) => {
            if (typeof item === "string") {
              return (
                <span key={item + i} className="p-5 text-xl font-bold">
                  ...
                </span>
              );
            } else {
              return (
                <Button
                  key={item}
                  onClick={() => setPageNumber(item)}
                  className={`cursor-pointer rounded-lg p-5 text-xl font-bold duration-100 hover:-translate-y-2 ${
                    pageNumber === item ? "underline" : ""
                  }`}
                >
                  {item + 1}
                </Button>
              );
            }
          });
        })()}
      </div>
    </div>
  );
}
