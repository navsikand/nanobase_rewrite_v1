"use client";

import { StructureCard } from "@/components/home/StructureCard";
import { oldCleanup } from "@/components/utils/misc";
import {
  getAllUserStructuresFetcher,
  getStructureImageFetcher,
  getUserProfileFetcher,
} from "@/helpers/fetchHelpers";
import { STRUCTURE_CARD_DATA } from "@/types";
import useSWR from "swr";

export default function ProfilePage() {
  const { data: ProfileData } = useSWR("profile", getUserProfileFetcher);
  const { data: structureData } = useSWR<STRUCTURE_CARD_DATA[]>(
    "getAllUserStructures",
    getAllUserStructuresFetcher
  );
  const { data: fetchedData } = useSWR(
    structureData ? "getStructuresWithImages" : null,
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

  return ProfileData ? (
    <div className="">
      {/* Header text */}
      <div className="flex flex-col w-11/12 mx-auto justify-center items-center mt-20 lg:w-[65%] ">
        <div className="w-full space-y-3">
          <h2 className="text-4xl font-semibold">
            {`${oldCleanup(ProfileData.firstName)} ${oldCleanup(ProfileData.lastName)}`}
          </h2>
          <div className="space-y-2 mt-3">
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
          </div>
          <h2 className="text-4xl font-semibold">Structures</h2>
          <div className="space-y-2 mt-3">
            {/* <div className="flex justify-center mb-2 space-x-2">
                <Input
                  name="full_name"
                  type="text"
                  placeholder="Search..."
                  className={"bg-gray-400/20 rounded-xl p-2"}
                  value={serachQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Select
                  onChange={(e) =>
                    setSearchByParameter(
                      serachByFields[parseInt(e.target.value)].name
                    )
                  }
                  className="rounded-lg"
                >
                  {serachByFields.map((field) => (
                    <option value={field.id} key={field.id}>
                      {field.name}
                    </option>
                  ))}
                </Select>
              </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {fetchedData?.map(
                ({ User, structure, isOld, image, flatStructureId }) => (
                  <StructureCard
                    flatStructureId={flatStructureId}
                    User={User}
                    isOld={isOld}
                    structure={structure}
                    key={structure.id}
                    image={image}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>Loading</p>
  );
}
