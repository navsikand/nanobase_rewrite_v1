import { STRUCTURE_CARD_DATA } from "@/test_data";
import Image from "next/image";
import Link from "next/link";

export const StructureCard = ({
  uploaded_by,
  description,
  uploaded_date,
  name,
  // author,
  slug,
  image_slug,
}: STRUCTURE_CARD_DATA): JSX.Element => {
  return (
    <div className="border-2 px-5 pt-5 rounded-2xl bg-stone-50 hover:shadow-lg duration-200">
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
            href={`/structures/${slug}`}
            className="aspect-square w-full border-2 rounded-lg relative"
          >
            <span className="sr-only">Nanobase</span>

            <Image
              src={image_slug}
              fill={true}
              className="object-contain"
              alt="Nanobase"
            />
          </Link>
        </div>

        {/* Card header */}
        <div className="flex justify-between text-sm font-extralight mt-2">
          <h2>{name}</h2>
        </div>

        {/* Card footer */}
        <div className="pb-2">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};
