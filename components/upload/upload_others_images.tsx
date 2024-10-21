"use client";

import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type props = {
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  structureId: number | null | undefined;
  selectedIndex: number;
};

export const UploadImages = ({
  selectedIndex,
  setSelectedIndex,
  structureId,
}: props): JSX.Element => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Create FormData object to send structureId and images
    const imageFormData = new FormData();
    imageFormData.append("structure_id", structureId?.toString() || "");

    // Ensure uploadedImages is an array of File objects
    uploadedImages.forEach((image) => {
      imageFormData.append("images", image);
    });

    // Send the request
    await fetch("http://localhost:3002/api/v1/structure/uploadImages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Attach token here
      },
      body: imageFormData, // Send FormData with structureId and images
    });

    setSelectedIndex(selectedIndex + 1);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadedImages(Array.from(files ? files : []));
  };

  return (
    <div>
      <div>
        <form onSubmit={handleImageSubmit}>
          <input
            type="file"
            multiple
            name="images"
            onChange={handleImageChange}
          />
          <button type="submit">Upload Image</button>
        </form>
      </div>
    </div>
  );
};
