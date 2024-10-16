"use client";

import { STRUCTURE_CARD_DATA } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function StructurePage({
  params: { id: structureId },
}: {
  params: { id: string };
}) {
  const [structureData, setStructureData] =
    useState<STRUCTURE_CARD_DATA | null>(null);

  const [allStructureImages, setAllStructureImages] = useState<string[]>(
    []
  );

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `http://localhost:3002/api/v1/structure/getStructureById?id=${structureId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const fetchedStructure: STRUCTURE_CARD_DATA = (await response.json())
        .structure as STRUCTURE_CARD_DATA;

      setStructureData(fetchedStructure);
    })();
  }, [structureId]);

  useEffect(() => {
    (async () => {
      const allImageNamesResponse = await fetch(
        `http://localhost:3002/api/v1/structure/getAllStructureImagesPaths?id=${structureId}`
      );

      const allImageNames: string[] = await allImageNamesResponse.json();
      const allImages: string[] = [];

      allImageNames.map(async (imageName) => {
        const response = await fetch(
          `http://localhost:3002/api/v1/structure/getStructureImageByName/${imageName}?id=${structureId}`
        );

        if (!response.ok) {
          throw new Error("Image not found");
        }
        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        allImages.push(imageObjectURL);
      });
      setAllStructureImages(allImages);
    })();
  }, [structureId]);

  return (
    <div>
      <div className="grid grid-cols-2">
        <div>{/* <Image /> */}</div>
        <div>
          <h2>{structureData?.title}</h2>
          <p>{structureData?.uploadDate?.toLocaleString()}</p>
          <p>{structureData?.description}</p>
          {/* <iframe src="https://sulcgroup.github.io/oxdna-viewer/"></iframe> */}
        </div>

        {allStructureImages.map((image) => (
          <div className="flex" key={image}>
            <div className="aspect-square w-full border-2 rounded-lg relative">
              {image && (
                <Image
                  src={image}
                  fill={true}
                  className="object-contain"
                  alt={"H"}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
