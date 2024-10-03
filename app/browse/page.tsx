import { StructureCard } from "@/components/home/StructureCard";
import { DUMMY_STRUCTURE_CARD_DATA } from "@/test_data";

export default function Browse() {
  return (
    <div className="grid grid-cols-3">
      {DUMMY_STRUCTURE_CARD_DATA.map(
        ({
          author,
          description,
          image_slug,
          name,
          slug,
          uploaded_by,
          uploaded_date,
        }) => (
          <StructureCard
            author={author}
            description={description}
            image_slug={image_slug}
            name={name}
            slug={slug}
            uploaded_by={uploaded_by}
            uploaded_date={uploaded_date}
            key={name}
          />
        )
      )}
    </div>
  );
}
