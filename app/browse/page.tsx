"use client";

import { StructureCard } from "@/components/home/StructureCard";
import {
  dexie_getAllStructureCardDataPaginated,
  SEARCH_BY,
} from "@/helpers/dexieHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import {
  Input,
  Select,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

export default function Browse() {
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
    // { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 2, name: SEARCH_BY.KEYWORD },
    { id: 3, name: SEARCH_BY.DESCRIPTION },
  ];
  const dexieData = useLiveQuery(
    () =>
      dexie_getAllStructureCardDataPaginated(
        pageNumber,
        searchQuery,
        searchType
      ),
    [pageNumber]
  );

  useEffect(() => {
    if (dexieData && dexieData.length !== 0) {
      const ret: (STRUCTURE_CARD_DATA & { image: string })[] = [];
      dexieData.map((i) => {
        ret.push({
          ...i,
          image:
            i.image.size === 0
              ? "/images/no-structure-img.webp"
              : URL.createObjectURL(i.image),
        });
      });

      setCardsToDisplay(ret);
    }
  }, [dexieData]);

  return (
    <div className="mx-auto w-11/12">
      <div className="flex justify-center mb-2 space-x-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"bg-white rounded-xl p-2"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchType(serachByFields[parseInt(e.target.value)].name)
          }
          className="rounded-lg bg-white"
        >
          {serachByFields.map((field) => (
            <option value={field.id} key={field.id} className="bg-white/20">
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <TabGroup>
        <TabPanels>
          <TabPanel className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {cardsToDisplay.map(
              ({ User, structure, isOld, image, flatStructureId }) => (
                <StructureCard
                  flatStructureId={flatStructureId}
                  User={User}
                  isOld={isOld}
                  structure={structure}
                  key={structure.id}
                  image={image}
                />
              )
            )}
          </TabPanel>
        </TabPanels>

        <TabList className={"flex justify-center mt-5"}>
          {cardsToDisplay.map((_, i) => (
            <Tab
              key={i}
              className={
                "p-5 rounded-lg hover:-translate-y-2 font-bold text-xl duration-100"
              }
            >
              {i}
            </Tab>
          ))}
        </TabList>
      </TabGroup>
    </div>
  );
}
