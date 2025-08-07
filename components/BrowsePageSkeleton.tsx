import { StructureCardSkeleton } from "./StructureCardSkeleton";

export const BrowsePageSkeleton = () => {
  return (
    <div className="mx-auto w-11/12 animate-pulse">
      <div className="mb-2 flex justify-center space-x-2">
        <div className="h-10 w-48 rounded-xl bg-gray-200"></div>
        <div className="h-10 w-32 rounded-lg bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
        <StructureCardSkeleton />
      </div>
    </div>
  );
};
