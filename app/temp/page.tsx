// import { StructureCard } from "@/components/home/StructureCard";
"use client";
import { useState } from "react";

export default function Temp() {
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file input change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle form submit
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    // Create a FormData object to store the file
    const formData = new FormData();
    formData.append("image", selectedFile ? selectedFile : ""); // 'image' is the key, can be any string

    // Send the POST request using fetch or axios
    try {
      const response = await fetch(
        "http://localhost:3002/api/v1/structure/image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Image uploaded successfully:", result);
      } else {
        console.error("Failed to upload image:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload Image</button>
    </form>
  );
}
