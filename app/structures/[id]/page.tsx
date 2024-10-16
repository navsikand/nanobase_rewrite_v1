"use client";

import { TEMP_STRUCTURE } from "@/db_types";
import { useEffect, useState } from "react";

export default function StructurePage({
  params: { id: structureId },
}: {
  params: { id: string };
}) {
  const [structureData, setStructureData] =
    useState<TEMP_STRUCTURE | null>(null);
  useEffect(() => {
    (async () => {
      // const response = await fetch(
      //   // `http://localhost:3002/api/v1/structure/getStructureById?id=${structureId}`,
      //   `https://6sgjdfxr-3002.usw3.devtunnels.ms/api/v1/structure/getStructureById?id=${structureId}`,
      //   {
      //     method: "GET",
      //   }
      // );

      const rep = {
        structure: {
          id: 421,
          title: " DNA ring 60nm liposome scaffold - Yang - Nat Chem 2016",
          type: "",
          description:
            " Yang et al describes a novel method for guided liposome formation inside a DNA origami ring.Due to the formation inside DNA origami ring the liposomes attain a much uniform size distribution compared to regular uncontrolled liposome formation methods.The application of this method ranges from drug delivery to artificial cell or artificial organelle synthesis.",
          datePublished: "2024-10-11T18:13:59.005Z",
          citation: "",
          paperLink: "",
          licensing: "",
          uploadDate: "2024-10-11T18:13:59.006Z",
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
          statsData: null,
          userId: "8824f2d4-15e4-4691-9196-5be858f54039",
          oldUserId: null,
          oldId: 20,
        },
      };

      setStructureData({
        ...rep.structure,
        datePublished: new Date(rep.structure.datePublished),
        uploadDate: new Date(rep.structure.uploadDate),
      });
    })();
  }, [structureId]);

  return (
    <div>
      <div className="grid grid-cols-2">
        <div>{/* <Image /> */}</div>
        <div>
          <h2>{structureData?.title}</h2>
          <p>{structureData?.uploadDate.toLocaleString()}</p>
          <p>{structureData?.description}</p>
          <iframe src="https://sulcgroup.github.io/oxdna-viewer/"></iframe>
        </div>
      </div>
    </div>
  );
}
