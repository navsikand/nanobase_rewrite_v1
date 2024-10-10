"use client";

import { StructureCard } from "@/components/home/StructureCard";
import {
  DUMMY_STRUCTURE_CARD_DATA,
  STRUCTURE_CARD_DATA,
} from "@/test_data";
import { Input } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function Browse() {
  const [cardsToDisplay, setCardsToDisplay] = useState<
    STRUCTURE_CARD_DATA[]
  >(DUMMY_STRUCTURE_CARD_DATA);

  const [queryValue, setQueryValue] = useState("");

  useEffect(() => {
    setCardsToDisplay(
      DUMMY_STRUCTURE_CARD_DATA.filter((c) =>
        c.name.toLowerCase().includes(queryValue.toLowerCase())
      )
    );
  }, [queryValue]);

  return (
    <div>
      <div>
        <Input
          name="full_name"
          type="text"
          placeholder="Search..."
          className={"bg-gray-400/20 rounded-xl p-2"}
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3">
        {cardsToDisplay.map(
          ({
            author,
            description,
            image_slug,
            name,
            slug,
            uploaded_by,
            uploaded_date,
          }) => (
            <StructureCard
              author={author}
              description={description}
              image_slug={image_slug}
              name={name}
              slug={slug}
              uploaded_by={uploaded_by}
              uploaded_date={uploaded_date}
              key={name}
            />
          )
        )}
      </div>
    </div>
  );
}
