"use client";

import {
  Button,
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Input,
} from "@headlessui/react";
import { useState } from "react";

const tags = [
  { id: 1, name: "Title" },
  { id: 2, name: "Author" },
  { id: 3, name: "Application" },
  { id: 4, name: "Modification" },
  { id: 5, name: "Keyword" },
  { id: 6, name: "User" },
];

export const TopNavbar = (): JSX.Element => {
  const [selectedPerson, setSelectedPerson] = useState<{
    id: number;
    name: string;
  } | null>({ id: -1, name: "" });

  const [query, setQuery] = useState("");

  const filteredTags =
    query === ""
      ? tags
      : tags.filter((tag) => {
          return tag.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className="pr-4 flex items-center">
      <div className="flex justify-between w-full">
        {/* Search */}
        <div>
          {/* Search input */}
          <Input name="full_name" type="text" />

          {/* Search by dropdown */}
          <Combobox
            value={selectedPerson}
            onChange={setSelectedPerson}
            onClose={() => setQuery("")}
          >
            <ComboboxInput
              aria-label="Assignee"
              displayValue={(
                tag: {
                  id: number;
                  name: string;
                } | null
              ) => tag?.name || ""}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ComboboxOptions
              anchor="bottom"
              className="border empty:invisible bg-black/40"
            >
              {filteredTags.map((person) => (
                <ComboboxOption
                  key={person.id}
                  value={person}
                  className="data-[focus]:bg-blue-100"
                >
                  {person.name}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>

        {/* Sign in/Profile */}
        <div>
          <Button>Sign in</Button>
        </div>
      </div>
    </div>
  );
};
