import { STRUCTURE_CARD_DATA } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const StructureCard = ({
  description,
  id,
  title,
  uploaded_by,
  uploaded_date,
  // applications,
  // authors,
  // citation,
  // datePublished,
  // type,
  // uploadDate,
  // keywords,
  // slug,
}: STRUCTURE_CARD_DATA): JSX.Element => {
  const [image, setImage] = useState<string>();

  useEffect(() => {
    fetch(
      `http://localhost:3002/api/v1/structure/getStructureDisplayImage?id=${id}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.blob())
      .then((imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        setImage(imageUrl);
      })
      .catch((err) =>
        console.error("Error fetching the first image:", err)
      );
  }, [id]);

  return (
    <div className="border-2 px-5 pt-5 rounded-lg bg-stone-50 hover:-translate-y-1 hover:shadow-xl duration-200">
      <div className="w-11/12 mx-auto">
        <p className="text-xs font-extralight text-right">
          Uploaded by {uploaded_by} |{" "}
          {uploaded_date
            ?.toLocaleString()
            .split(":")[0]
            .substring(
              0,
              uploaded_date.toLocaleString().split(":")[0].length - 3
            )}
        </p>

        {/* Image */}

        <div className="flex">
          <Link
            href={"/structures/" + id}
            className="aspect-square w-full border-2 rounded-lg relative"
          >
            <span className="sr-only">{title}</span>
            {image && (
              <Image
                src={image}
                fill={true}
                className="object-contain"
                alt={title}
              />
            )}
          </Link>
        </div>

        {/* Card header */}
        <div className="flex justify-between text-sm font-extralight mt-2">
          <h2>{title}</h2>
        </div>

        {/* Card footer */}
        <div className="pb-2">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};
