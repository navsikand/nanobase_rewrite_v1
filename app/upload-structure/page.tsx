"use client";

import { UploadStructureInformation } from "@/components/upload/structure_data";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { ChangeEvent, useState } from "react";

type type_formData = {
  title: string;
  type: string;
  description: string;
  datePublished: Date;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;

  applications: [];
  authors: [];
};

export default function UploadStructure() {
  const [structureId, setStructureId] = useState<number | null>();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagesUploadedBoolean, setImagesUploadedBoolean] =
    useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [formData, setFormData] = useState<type_formData>({
    title: "",
    type: "",
    description: "",
    datePublished: new Date(),
    citation: "",
    paperLink: "",
    licensing: "",
    private: false,

    applications: [],
    authors: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const response = await fetch(
      "http://localhost:3002/api/v1/structure/createStructure",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Attach token here

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          keywords: [],
          structure_data: formData,
        }),
      }
    );
    const id: number = (await response.json()).structure_id;
    setStructureId(id);
    setSelectedIndex(selectedIndex + 1);
    console.log("WORKED");
  };

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

    setImagesUploadedBoolean(true);
    setSelectedIndex(selectedIndex + 1);
    console.log("IMAGES WORKED");
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Create FormData object to send structureId and images
    const imageFormData = new FormData();
    imageFormData.append("structure_id", structureId?.toString() || "");

    // Ensure uploadedImages is an array of File objects
    uploadedImages.forEach((file) => {
      imageFormData.append("files", file);
    });

    // Send the request
    await fetch("http://localhost:3002/api/v1/structure/uploadFiles", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Attach token here
      },
      body: imageFormData, // Send FormData with structureId and images
    });

    console.log("Files WORKED");
  };

  return (
    <div className="">
      <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <TabList className={`space-x-3`}>
          <Tab
            disabled={structureId === null}
            className={`bg-gray-400 rounded-lg p-2`}
          >
            Create structure
          </Tab>

          <Tab
            disabled={structureId === null}
            className={`bg-gray-400 rounded-lg p-2`}
          >
            Upload images
          </Tab>

          <Tab
            disabled={!imagesUploadedBoolean}
            className={`bg-gray-400 rounded-lg p-2`}
          >
            Upload files
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <UploadStructureInformation
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
            />
          </TabPanel>
          <TabPanel>
            <div>
              <form onSubmit={handleImageSubmit}>
                <input
                  type="file"
                  multiple
                  name="images"
                  onChange={handleFileChange}
                />
                <button type="submit">Upload Image</button>
              </form>
            </div>
          </TabPanel>
          <TabPanel>
            <div>
              <form onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  multiple
                  name="images"
                  onChange={handleFileChange}
                />
                <button type="submit">Upload Files</button>
              </form>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
