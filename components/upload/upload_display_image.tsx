import { apiRoot } from "@/helpers/fetchHelpers";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type props = {
  setDisplayImageUploaded: Dispatch<SetStateAction<boolean>>;
  structureId: number | null | undefined;
};

export const UploadDisplayImage = ({
  setDisplayImageUploaded,
  structureId,
}: props): JSX.Element => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadedImages(Array.from(files ? files : []));
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Create FormData object to send structureId and images
    const imageFormData = new FormData();
    imageFormData.append("structure_id", structureId?.toString() || "");

    // Ensure uploadedImages is an array of File objects
    uploadedImages.forEach((image) => {
      imageFormData.append("image", image);
    });

    // Send the request
    await fetch(`${apiRoot}/structure/uploadDisplayImage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Attach token here
      },
      body: imageFormData, // Send FormData with structureId and images
    });

    setDisplayImageUploaded(true);
  };

  return (
    <div>
      <form onSubmit={handleImageSubmit}>
        <input type="file" name="image" onChange={handleFileChange} />
        <button type="submit">Upload Image</button>
      </form>
    </div>
  );
};
