export const StructureCardSkeleton = () => {
  return (
    <div className="w-full animate-pulse rounded-lg border-2 border-gray-100 bg-white px-5">
      <div className="mx-auto w-11/12">
        <div className="flex w-full items-center justify-between pt-3 pb-1 text-right text-xs font-extralight">
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>

        {/* Image */}
        <div className="relative flex aspect-[9/16] max-h-72 w-full rounded-lg rounded-b-none border-b-[1px] border-b-gray-500 bg-gray-200"></div>

        {/* Card header */}
        <div className="mt-2 flex justify-between text-sm font-extralight">
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        </div>

        {/* Card footer */}
        <div className="pb-2">
          <div className="mt-1 h-3 w-full rounded bg-gray-200"></div>
          <div className="mt-1 h-3 w-5/6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
