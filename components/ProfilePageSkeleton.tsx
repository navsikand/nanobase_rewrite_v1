import { StructureCardSkeleton } from "./StructureCardSkeleton";

export const ProfilePageSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mx-auto mt-20 flex w-11/12 flex-col items-center justify-center lg:w-[65%]">
        <div className="w-full space-y-3">
          <div className="h-10 w-1/2 rounded bg-gray-200"></div>
          <div className="mt-3 space-y-2">
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/4 rounded bg-gray-200"></div>

            <div className="flex space-x-2 pt-2">
              <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
              <div className="h-10 w-32 rounded-lg bg-gray-200"></div>
            </div>
          </div>

          <div className="h-10 w-1/3 rounded bg-gray-200 pt-4"></div>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              <StructureCardSkeleton />
              <StructureCardSkeleton />
              <StructureCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
