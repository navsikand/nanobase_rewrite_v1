import { STRUCTURE_CARD_DATA } from "@/types";
import Image from "next/image";
import Link from "next/link";

export const StructureCard = ({
  structure: { description, id, title, uploadDate },
  User,
  image,
}: STRUCTURE_CARD_DATA & { image: string }) => {
  const imageSrc =
    image && image !== "" ? image : "/images/no-structure-img.webp";

  return (
    <Link href={"/structures/" + id}>
      <div className="px-5 rounded-lg bg-white hover:-translate-y-1 hover:shadow-xl duration-200 border-2 border-gray-100">
        <div className="w-11/12 mx-auto">
          <p className="text-xs font-extralight text-right pt-3 pb-1">
            Uploaded by {User.firstName} {User.lastName} on{" "}
            {uploadDate
              ?.toLocaleString()
              .split(":")[0]
              .substring(
                0,
                uploadDate.toLocaleString().split(":")[0].length - 3
              )}
          </p>

          {/* Image */}
          <div className="flex">
            <Link
              href={"/structures/" + id}
              className="aspect-[9/16] w-full rounded-lg relative max-h-72 rounded-b-none border-b-gray-500 border-b-[1px]"
            >
              <span className="sr-only">{title}</span>
              <Image
                src={imageSrc}
                fill={true}
                className="object-contain"
                alt={title}
              />
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
    </Link>
  );
};
