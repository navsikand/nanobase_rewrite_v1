"use client";

import { UploadDisplayImage } from "@/components/upload/upload_display_image";
import { UploadImages } from "@/components/upload/upload_others_images";
import { UploadStructureInformation } from "@/components/upload/upload_structure_data";
import { apiRoot } from "@/helpers/fetchHelpers";
import {
  Select,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { ChangeEvent, useState } from "react";

export default function UploadStructure() {
  const [structureId, setStructureId] = useState<number | null>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [displayImageUploaded, setDisplayImageUploaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadedFiles(Array.from(files ? files : []));
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const imageFormData = new FormData();
    imageFormData.append("structure_id", structureId?.toString() || "");

    uploadedFiles.forEach((file) => {
      imageFormData.append("files", file);
    });

    // Send the request
    await fetch(`${apiRoot}/structure/uploadFiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Attach token here
      },
      body: imageFormData, // Send FormData with structureId and images
    });

    console.log("Files WORKED");
  };

  enum ACCEPT {
    OXVIEW = ".oxview",
    DATTOP = ".dat, .top",
    PDB = ".pdb",
  }

  const serachByFields = [
    { id: 0, name: ACCEPT.OXVIEW },
    { id: 1, name: ACCEPT.DATTOP },
    { id: 2, name: ACCEPT.PDB },
  ];

  const [fileTypeParameter, setFileTypeParameter] = useState<ACCEPT>(
    ACCEPT.OXVIEW
  );

  return (
    <div className="">
      <TabGroup
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        className={"flex flex-col justify-center items-center"}
      >
        <TabList className={`space-x-3 mx-auto`}>
          <Tab
            disabled={structureId !== undefined}
            className={`bg-indigo-300/10 data-[selected]:bg-indigo-300/50 rounded-lg p-2`}
          >
            Create structure
          </Tab>

          <Tab
            disabled={structureId === undefined}
            className={`bg-indigo-300/10 data-[selected]:bg-indigo-300/50 rounded-lg p-2`}
          >
            Upload images
          </Tab>

          <Tab
            disabled={!displayImageUploaded}
            className={`bg-indigo-300/10 data-[selected]:bg-indigo-300/50 rounded-lg p-2`}
          >
            Upload files
          </Tab>
        </TabList>
        <TabPanels className="flex-1 w-full">
          <TabPanel>
            <UploadStructureInformation
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              setStructureId={setStructureId}
            />
          </TabPanel>
          <TabPanel>
            <UploadDisplayImage
              setDisplayImageUploaded={setDisplayImageUploaded}
              structureId={structureId}
            />
            <UploadImages
              setSelectedIndex={setSelectedIndex}
              structureId={structureId}
              selectedIndex={selectedIndex}
            />
          </TabPanel>
          <TabPanel>
            <div>
              <form onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  multiple
                  accept={fileTypeParameter}
                  name="files"
                  onChange={handleFileChange}
                />
                <button type="submit">Upload Files</button>
              </form>
              <Select
                onChange={(e) =>
                  setFileTypeParameter(
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
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
