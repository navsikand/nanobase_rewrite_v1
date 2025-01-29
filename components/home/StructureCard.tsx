import { STRUCTURE_CARD_DATA } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { oldCleanup } from "../utils/misc";
import Skeleton from "react-loading-skeleton";

export const StructureCard = ({
  structure: { description, id, title, uploadDate },
  User,
  image,
}: STRUCTURE_CARD_DATA & {
  image: string;
}) => {
  return (
    <div className="px-5 rounded-lg bg-stone-50 hover:-translate-y-1 hover:shadow-xl duration-200">
      <div className="w-11/12 mx-auto">
        <p className="text-xs font-extralight text-right pt-3 pb-1">
          Uploaded by {oldCleanup(User.firstName)} {oldCleanup(User.lastName)}{" "}
          on{" "}
          {uploadDate
            ?.toLocaleString()
            .split(":")[0]
            .substring(0, uploadDate.toLocaleString().split(":")[0].length - 3)}
        </p>

        {/* Image */}
        <div className="flex">
          <Link
            href={"/structures/" + id}
            className="aspect-[9/16] w-full border border-gray-500 rounded-lg relative max-h-72"
          >
            <span className="sr-only">{title}</span>
            {image ? (
              <Image
                src={image === "" ? "/images/no-structure-img.webp" : image}
                fill={true}
                className="object-contain"
                alt={title}
              />
            ) : (
              <Skeleton />
            )}
          </Link>
        </div>

        {/* Card header */}
        <div className="flex justify-between text-sm font-extralight mt-2">
          <h2 className="line-clamp-1">{title}</h2>
        </div>

        {/* Card footer */}
        <div className="pb-2">
          <p className="line-clamp-3">{description}</p>
        </div>
      </div>
    </div>
  );
};
