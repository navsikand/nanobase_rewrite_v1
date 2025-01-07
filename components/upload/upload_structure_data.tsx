"use client";

import { apiRoot } from "@/helpers/fetchHelpers";
import { StructureTypes } from "@/types";
import {
  Button,
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Textarea,
} from "@headlessui/react";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type type_formData = {
  title: string;
  type: string;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;

  applications: [];
  authors: [];
};

type props = {
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  setStructureId: Dispatch<SetStateAction<number | null | undefined>>;
  selectedIndex: number;
};

export const UploadStructureInformation = ({
  selectedIndex,
  setSelectedIndex,
  setStructureId,
}: props): JSX.Element => {
  const [formData, setFormData] = useState<type_formData>({
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const response = await fetch(`${apiRoot}/structure/createStructure`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Attach token here

        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        keywords: [],
        structure_data: formData,
      }),
    });
    const id: number = (await response.json()).structure_id;
    setStructureId(id);
    setSelectedIndex(selectedIndex + 1);
  };

  const [structureTypeQuery, setStructureTypeQuery] = useState("");

  const structureTypes = [
    { id: 1, name: StructureTypes.DNA },
    { id: 2, name: StructureTypes.RNA },
    { id: 3, name: StructureTypes.DNA_RNA_HYBRID },
    { id: 4, name: StructureTypes.NUCLEIC_ACID_PROTEIN_HYBRID },
  ];

  const [selectedType, setSelectedType] = useState<{
    id: number;
    name: string;
  }>();

  const filteredTypes: {
    id: number;
    name: string;
  }[] =
    structureTypeQuery === ""
      ? structureTypes
      : structureTypes
          .filter((tag) => {
            return tag.name
              .toLowerCase()
              .includes(structureTypeQuery.toLowerCase());
          })
          .concat([{ id: 5, name: structureTypeQuery as StructureTypes }]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      private: checked,
    });
  };

  const handleTypeChange = (e: { id: number; name: string }) => {
    setFormData({
      ...formData,
      type: e.name,
    });
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      description: value,
    });
  };

  return (
    <div className="mx-auto w-1/2 mt-16">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Structure title */}
        <div className="flex flex-col">
          <input
            className="p-2 bg-stone-400/20 rounded-2xl"
            placeholder="Title..."
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Structure type */}

        <Combobox
          value={selectedType}
          onChange={(e) => {
            setSelectedType(filteredTypes[0]);
            handleTypeChange(e || filteredTypes[0]);
          }}
          onClose={() => setStructureTypeQuery("")}
        >
          <ComboboxInput
            aria-label="Assignee"
            className={"p-2 bg-stone-400/20 rounded-2xl"}
            displayValue={(type: { id: number; name: string }) => type?.name}
            placeholder="Type..."
            onChange={(event) => setStructureTypeQuery(event.target.value)}
          />
          <ComboboxOptions
            anchor="bottom"
            className="border empty:invisible bg-gray-500/30"
          >
            {filteredTypes.map((tag) => (
              <ComboboxOption
                key={tag.id}
                value={tag}
                className="data-[focus]:bg-blue-100 p-2 bg-stone-400 "
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
            onChange={handleTextAreaChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleCheckboxChange}
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
  );
};
