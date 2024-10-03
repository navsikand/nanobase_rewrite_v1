import { STRUCTURE_CARD_DATA } from "@/test_data";
import Image from "next/image";
import Link from "next/link";

export const StructureCard = ({
  uploaded_by,
  description,
  uploaded_date,
  name,
  // author,
  // slug,
  image_slug,
}: STRUCTURE_CARD_DATA): JSX.Element => {
  return (
    <div className="border-2 p-5">
      {/* Card header */}
      <div className="flex justify-between">
        <h2>{name}</h2>

        <p>
          Uploaded by {uploaded_by} | {uploaded_date.toISOString()}
        </p>
      </div>

      {/* Image */}
      <div className="flex">
        <Link href="/" className="aspect-square w-full relative">
          <span className="sr-only">Nanobase</span>

          <Image
            src={image_slug}
            fill={true}
            className="object-contain"
            alt="Nanobase"
          />
        </Link>
      </div>

      {/* Card footer */}
      <div>
        <p>{description}</p>
      </div>
    </div>
  );
};
