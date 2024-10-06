"use client";

import { props_prisma_createStructure, StructureTypes } from "@/types";
import {
  Button,
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Textarea,
} from "@headlessui/react";
import { ChangeEvent, useEffect, useState } from "react";

export default function UploadStructure() {
  const [formData, setFormData] = useState<props_prisma_createStructure>({
    title: "",
    type: "",
    description: "",
    datePublished: new Date(),
    citation: "",
    paperLink: "",
    licensing: "",
    private: false,

    applications: [],
    authors: [],

    structureFilePaths: [],
    expProtocolFilePaths: [],
    expResultsFilesPaths: [],
    simProtocolFilePaths: [],
    simResultsFilePaths: [],
    oxdnaFilePaths: [],

    displayImageIndex: 0,
    images: [],

    statsData: {},
  });

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      private: checked,
    });
  };

  const handleType = (e: { id: number; name: string }) => {
    setFormData({
      ...formData,
      type: e.name,
    });
  };

  const handleArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      description: value,
    });
  };

  const types = [
    { id: 1, name: StructureTypes.DNA },
    { id: 2, name: StructureTypes.RNA },
    { id: 3, name: StructureTypes.DNA_RNA_HYBRID },
    { id: 4, name: StructureTypes.NUCLEIC_ACID_PROTEIN_HYBRID },
  ];

  const [selectedType, setSelectedType] = useState<{
    id: number;
    name: string;
  }>(types[0]);
  const [query, setQuery] = useState("");

  const filteredTags: {
    id: number;
    name: string;
  }[] = [{ id: 5, name: query }].concat(
    query === ""
      ? types
      : types.filter((tag) => {
          return tag.name.toLowerCase().includes(query.toLowerCase());
        })
  );

  return (
    <div className="">
      <div className="mx-auto w-1/2 mt-16">
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("http://localhost:3002/api/v1/auth/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify(formData),
            });
            console.log(formData);
          }}
        >
          {/* Structure title */}
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Title..."
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* 
            Structure type
            // ! MAKE IT AN OPTION SELECT OR CUSTOM TEXT
          */}

          <Combobox
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e || filteredTags[0]);
              handleType(e || filteredTags[0]);
            }}
            onClose={() => setQuery("")}
          >
            <ComboboxInput
              aria-label="Assignee"
              displayValue={(type: { id: number; name: string }) =>
                type?.name
              }
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxOptions
              anchor="bottom"
              className="border empty:invisible"
            >
              {filteredTags.map((tag) => (
                <ComboboxOption
                  key={tag.id}
                  value={tag}
                  className="data-[focus]:bg-blue-100"
                >
                  {tag.name}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>

          {/* <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Type..."
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div> */}

          {/* 
            Structure description
          */}
          <div className="flex flex-col">
            <Textarea
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Description..."
              id="description"
              name="description"
              value={formData.description}
              onChange={handleArea}
              required
            />
          </div>

          {/* 
            Structure date published
          */}
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              id="datePublished"
              name="datePublished"
              type="date"
              value={formData.datePublished.toString()}
              onChange={handleChange}
              required
            />
          </div>

          {/* 
            Structure citation
          */}
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Citation..."
              id="citation"
              name="citation"
              type="text"
              value={formData.citation}
              onChange={handleChange}
              required
            />
          </div>

          {/* 
            Structure paper link
          */}
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Paper link..."
              id="paperLink"
              name="paperLink"
              type="text"
              value={formData.paperLink}
              onChange={handleChange}
              required
            />
          </div>

          {/* 
            Structure licensing
          */}
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Licensing..."
              id="licensing"
              name="licensing"
              type="text"
              value={formData.licensing}
              onChange={handleChange}
              required
            />
          </div>

          {/* 
            Structure private
          */}
          <div className="flex items-center">
            Private:
            <input
              className="bg-stone-400/20 rounded-2xl ml-2"
              id="private"
              name="private"
              type="checkbox"
              value={JSON.stringify(formData.private)}
              onChange={handleCheckbox}
              required
            />
          </div>

          <Button
            className={
              "rounded-lg px-6 py-2 font-semibold text-lg bg-stone-400/20 text-black"
            }
            type="submit"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
