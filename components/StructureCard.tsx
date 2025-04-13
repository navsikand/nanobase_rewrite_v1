import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { apiRoot } from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/db";

export const StructureCard = ({
  structure: { description, id, title, uploadDate },
  User,
  image,
  edit_menu,
}: STRUCTURE_CARD_DATA & { image: string } & { edit_menu?: boolean }) => {
  const imageSrc =
    image && image !== "" ? image : "/images/no-structure-img.webp";

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }
      const response = await fetch(
        `${apiRoot}/structure/deleteStructureById?id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMsg = "Failed to delete structure.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      } else {
        window.location.reload();
      }

      try {
        const data = await response.json();
        if (!data) {
          console.error("No data");
        }
      } catch {
        throw new Error("Received invalid response from the server.");
      }

      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      console.error(error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Link href={"/structures/" + id}>
        <div className="cursor-pointer rounded-lg border-2 border-gray-100 bg-white px-5 duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="mx-auto w-11/12">
            <p className="flex w-full items-center justify-between pt-3 pb-1 text-right text-xs font-extralight">
              {edit_menu && (
                <div className="flex gap-2">
                  <Link
                    href={"/edit-structure/" + id}
                    className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer rounded-lg bg-red-200 px-4 py-2 text-sm font-semibold text-red-800 duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    Delete
                  </button>
                </div>
              )}

              <span>
                Uploaded by {User.firstName} {User.lastName} on{" "}
                {uploadDate
                  ?.toLocaleString()
                  .split(":")[0]
                  .substring(
                    0,
                    uploadDate.toLocaleString().split(":")[0].length - 3
                  )}
              </span>
            </p>

            {/* Image */}
            <div className="relative flex aspect-[9/16] max-h-72 w-full rounded-lg rounded-b-none border-b-[1px] border-b-gray-500">
              <span className="sr-only">{title}</span>
              <Image
                src={imageSrc}
                fill={true}
                className="object-contain"
                alt={title}
              />
            </div>

            {/* Card header */}
            <div className="mt-2 flex justify-between text-sm font-extralight">
              <h2 className="line-clamp-1">{title}</h2>
            </div>

            {/* Card footer */}
            <div className="pb-2">
              <p className="line-clamp-3">{description}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Modal for delete confirmation */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-opacity-25 fixed inset-0 bg-black" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Confirm Deletion
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this structure?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-200 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-300"
                      onClick={() => {
                        handleDelete(id);
                        setIsModalOpen(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
