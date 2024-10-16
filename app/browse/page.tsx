"use client";

import { StructureCard } from "@/components/home/StructureCard";
import { STRUCTURE_CARD_DATA } from "@/types";
import { Input, Select } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function Browse() {
  const [cardsToDisplay, setCardsToDisplay] = useState<
    STRUCTURE_CARD_DATA[]
  >([]);
  const [fetchedData, setFetchedData] = useState<STRUCTURE_CARD_DATA[]>(
    []
  );

  enum SEARCH_BY {
    TITLE = "Title",
    AUTHOR = "Author",
    APPLICATION = "Application",
    KEYWORD = "Keyword",
    DESCRIPTION = "Description",
  }

  const serachByFields = [
    { id: 0, name: SEARCH_BY.TITLE },
    { id: 1, name: SEARCH_BY.AUTHOR },
    { id: 2, name: SEARCH_BY.APPLICATION },
    { id: 3, name: SEARCH_BY.KEYWORD },
    { id: 4, name: SEARCH_BY.DESCRIPTION },
  ];

  const [searchByParameter, setSearchByParameter] = useState(
    SEARCH_BY.TITLE
  );
  const [queryValue, setQueryValue] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "http://localhost:3002/api/v1/structure/getAllPublicStructures_paginated",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const fetchedStructures: STRUCTURE_CARD_DATA[] = (
        await response.json()
      ).structures as STRUCTURE_CARD_DATA[];

      setFetchedData(fetchedStructures);
    })();
  }, []);

  useEffect(() => {
    if (queryValue === "" && queryValue.length === 0) {
      setCardsToDisplay(fetchedData);
    } else {
      const setVal = fetchedData.filter((data) => {
        switch (searchByParameter) {
          case SEARCH_BY.TITLE:
            if (data.title) {
              return data.title
                .toLowerCase()
                .includes(queryValue.toLowerCase());
            } else {
              return true;
            }
          case SEARCH_BY.AUTHOR:
            if (data.authors) {
              let ret = false;

              data.authors.map((application) => {
                ret = application
                  .toLowerCase()
                  .includes(queryValue.toLowerCase());
              });

              return ret;
            } else {
              return true;
            }
          case SEARCH_BY.DESCRIPTION:
            if (data.description) {
              return data.description
                .toLowerCase()
                .includes(queryValue.toLowerCase());
            } else {
              return true;
            }
          case SEARCH_BY.APPLICATION:
            if (data.applications) {
              let ret = false;

              data.applications.map((application) => {
                ret = application
                  .toLowerCase()
                  .includes(queryValue.toLowerCase());
              });

              return ret;
            } else {
              return true;
            }
          case SEARCH_BY.KEYWORD:
            if (data.keywords) {
              let ret = false;

              data.keywords.map((keyword) => {
                ret = keyword.name
                  .toLowerCase()
                  .includes(queryValue.toLowerCase());
              });

              return ret;
            } else {
              return true;
            }
        }
      });

      setCardsToDisplay(setVal);
    }
  }, [queryValue, fetchedData, searchByParameter, SEARCH_BY]);
  useEffect(() => {
    console.log(fetchedData[0]);
  }, [fetchedData]);

  return (
    <div className="mx-auto w-11/12">
      <div className="flex justify-center mb-2">
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"bg-gray-400/20 rounded-xl p-2"}
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
        />

        <Select
          onChange={(e) =>
            setSearchByParameter(
              serachByFields[parseInt(e.target.value)].name
            )
          }
          className="rounded-lg"
        >
          {serachByFields.map((field) => (
            <option value={field.id} key={field.id}>
              {field.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {cardsToDisplay.map(
          ({
            authors,
            description,
            title,
            slug,
            id,
            uploaded_by,
            uploaded_date,
            applications,
            keywords,
            citation,
            datePublished,
            type,
            uploadDate,
          }) => (
            <StructureCard
              id={id}
              citation={citation}
              datePublished={datePublished}
              type={type}
              uploadDate={uploadDate}
              authors={authors}
              description={description}
              title={title}
              slug={slug}
              uploaded_by={uploaded_by}
              uploaded_date={uploaded_date}
              key={id}
              applications={applications}
              keywords={keywords}
            />
          )
        )}
      </div>
    </div>
  );
}
