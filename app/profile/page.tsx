"use client";

import { ProfilePageSkeleton } from "@/components/ProfilePageSkeleton";
import { StructureCard } from "@/components/StructureCard";
import {
  getAllUserStructuresFetcher,
  getStructureImageFetcher,
  getUserProfileFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/db";
import { Button } from "@headlessui/react";
import Link from "next/link";
import useSWR from "swr";

export default function ProfilePage() {
  const { data: ProfileData, isLoading: isProfileLoading } = useSWR(
    "profile",
    getUserProfileFetcher
  );
  const { data: structureData } = useSWR<STRUCTURE_CARD_DATA[]>(
    "getAllUserStructures",
    getAllUserStructuresFetcher
  );
  const { data: fetchedData } = useSWR(
    structureData ? "profile_getStructuresWithImages" : null,
    async () => {
      if (!structureData) return [];
      const structures = await Promise.all(
        structureData.map(async (structure) => {
          const structureId = structure.structure.id;
          try {
            const imageUrl = structureId
              ? (await getStructureImageFetcher(structureId)).url
              : "";
            return { ...structure, image: imageUrl };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...structure, image: "" };
          }
        })
      );
      return structures;
    }
  );

  return isProfileLoading ? (
    <ProfilePageSkeleton />
  ) : ProfileData ? (
    <div className="">
      {/* Header text */}
      <div className="mx-auto mt-20 flex w-11/12 flex-col items-center justify-center lg:w-[65%]">
        <div className="w-full space-y-3">
          <h2 className="text-4xl font-semibold">
            {`${ProfileData.firstName} ${ProfileData.lastName}`}
          </h2>
          <div className="mt-3 space-y-2">
            <p>
              <b>Email:</b> {ProfileData.email}
            </p>
            <p>
              <b>Institution:</b> {ProfileData.institutionName}
            </p>
            <p>
              <b>Credits:</b> {ProfileData.credits}
            </p>
            <p>
              <b>Simulation Status:</b> {ProfileData.simulationBackendStatus}
            </p>
            <p>
              <b>Verified status:</b>{" "}
              {ProfileData.verified ? "Verified" : "Not verified"}
            </p>

            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/browse";
                }}
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                Sign Out
              </Button>

              <Link
                href={"/profile/reset"}
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                Reset password
              </Link>
            </div>
          </div>

          <h2 className="text-4xl font-semibold">Structures</h2>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {fetchedData?.map(
                ({ User, structure, image, flatStructureId }) => (
                  <StructureCard
                    flatStructureId={flatStructureId}
                    User={User}
                    structure={structure}
                    key={structure.id}
                    image={image}
                    edit_menu={true}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>Error loading profile.</p>
  );
}
