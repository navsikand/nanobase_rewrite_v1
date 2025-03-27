"use client";

import { getUserStructureByIdFetcher } from "@/helpers/fetchHelpers";
import {
  use,
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  Fragment,
} from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogTitle,
  Transition,
  Tab,
  TabGroup,
  TabList,
  TabPanels,
  TabPanel,
} from "@headlessui/react";

// --- Types ---
type FormData = {
  title: string;
  type: string;
  description: string;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;
  authors: string;
  keywords: string;
  applications: string;
};

type FileRelation = {
  fileName: string;
  description: string;
};

type ImageRelation = {
  imageName: string;
  description: string;
};

type RelationItemProps = {
  item: { description: string; [key: string]: string };
  onDelete: (name: string) => void;
  onEdit: (name: string, newDescription: string) => void;
  nameKey: string;
};

// --- RelationItem Component ---
// Updated styling to match the upload UI's FileEntryItem design.
const RelationItem = ({
  item,
  onDelete,
  onEdit,
  nameKey,
}: RelationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(item.description);
  const itemName = item[nameKey];

  const handleSave = () => {
    onEdit(itemName, tempDescription);
    setIsEditing(false);
  };

  return (
    <li className="flex items-center justify-between border p-2 rounded">
      <div>
        <span className="font-semibold">{itemName}</span>
        {" - "}
        {isEditing ? (
          <input
            type="text"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="p-1 border rounded ml-1"
          />
        ) : (
          <span>{item.description}</span>
        )}
      </div>
      <div className="space-x-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-black text-white rounded hover:-translate-y-1 hover:shadow-xl duration-200"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 bg-black text-white rounded hover:-translate-y-1 hover:shadow-xl duration-200"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => onDelete(itemName)}
          className="px-2 py-1 bg-black text-white rounded hover:-translate-y-1 hover:shadow-xl duration-200"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

// --- FileInputWithDescription Component ---
// (Same as in UploadStructure for consistency)
type FileInputWithDescriptionProps = {
  label: string;
  onAdd: (item: { file: File; description: string }) => void;
};

function FileInputWithDescription({
  label,
  onAdd,
}: FileInputWithDescriptionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");

  const handleAdd = () => {
    if (file) {
      onAdd({ file, description });
      setFile(null);
      setDescription("");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-medium">{label}</label>
      <input type="file" onChange={handleFileChange} className="mt-1 block" />
      <input
        type="text"
        placeholder="Enter description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-1 block p-2 border rounded"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
      >
        Add {label}
      </button>
    </div>
  );
}

// --- EditStructurePage Component ---
export default function EditStructurePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id: structureId } = use(params);

  const { data: server_structureData } = useSWR(
    structureId ? ["getUserStructureById", structureId] : null,
    ([, id]) => getUserStructureByIdFetcher("getUserStructureById", id)
  );

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    description: "",
    citation: "",
    paperLink: "",
    licensing: "",
    private: true,
    authors: "",
    keywords: "",
    applications: "",
  });

  // State for file and image relations.
  const [fileRelations, setFileRelations] = useState<FileRelation[]>([]);
  const [imageRelations, setImageRelations] = useState<ImageRelation[]>([]);

  // For tab switching.
  const [tabIndex, setTabIndex] = useState(0);

  // Modal for submission feedback.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    if (server_structureData) {
      setFormData({
        title: server_structureData.structure.title,
        type: server_structureData.structure.type,
        description: server_structureData.structure.description,
        citation: server_structureData.structure.citation,
        paperLink: server_structureData.structure.paperLink,
        licensing: server_structureData.structure.licensing,
        applications: server_structureData.structure.applications.join(", "),
        authors: server_structureData.structure.authors.join(", "),
        keywords: server_structureData.structure.keywords.join(", "),
        private: server_structureData.structure.private,
      });

      setImageRelations(server_structureData.structure.imageNameToDescRelation);
      setFileRelations(server_structureData.structure.fileNameToDescRelation);
    }
  }, [server_structureData]);

  // Generic change handler for text inputs.
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Handlers for file/image relations.
  const handleFileDelete = (fileName: string) => {
    setFileRelations(
      fileRelations.filter((file) => file.fileName !== fileName)
    );
  };

  const handleImageDelete = (imageName: string) => {
    setImageRelations(
      imageRelations.filter((image) => image.imageName !== imageName)
    );
  };

  const handleFileEdit = (fileName: string, newDescription: string) => {
    setFileRelations(
      fileRelations.map((file) =>
        file.fileName === fileName
          ? { ...file, description: newDescription }
          : file
      )
    );
  };

  const handleImageEdit = (imageName: string, newDescription: string) => {
    setImageRelations(
      imageRelations.map((image) =>
        image.imageName === imageName
          ? { ...image, description: newDescription }
          : image
      )
    );
  };

  // Handlers for adding new files/images.
  const handleAddFile = ({
    file,
    description,
  }: {
    file: File;
    description: string;
  }) => {
    setFileRelations([...fileRelations, { fileName: file.name, description }]);
  };

  const handleAddImage = ({
    file,
    description,
  }: {
    file: File;
    description: string;
  }) => {
    setImageRelations([
      ...imageRelations,
      { imageName: file.name, description },
    ]);
  };

  // Dummy submit handler with validations.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validate required text fields.
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        errors.push(`The field "${key}" is required.`);
      }
    });

    try {
      new URL(formData.paperLink);
    } catch {
      errors.push("Paper Link must be a valid URL.");
    }

    if (imageRelations.length < 1) {
      errors.push("At least one image is required.");
    }
    if (fileRelations.length < 1) {
      errors.push("At least one file is required.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
    } else {
      // Replace with your actual submission logic.
      console.log("Form submitted successfully!", {
        formData,
        fileRelations,
        imageRelations,
      });
      setResponseMessage("Structure updated successfully!");
      setIsModalOpen(true);
    }
  };

  // Shared styling for input fields.
  const inputClass =
    "w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1";

  return server_structureData ? (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6">Edit Structure</h2>
        <form onSubmit={handleSubmit}>
          <TabGroup selectedIndex={tabIndex} onChange={setTabIndex}>
            <TabList className="flex space-x-2 border-b border-gray-300 mb-4">
              <Tab
                className={({ selected }) =>
                  selected
                    ? "px-4 py-2 font-medium text-white bg-black rounded-t-md border border-gray-300 cursor-pointer"
                    : "px-4 py-2 font-medium text-black bg-gray-100 rounded-t-md hover:bg-gray-200 cursor-pointer"
                }
              >
                Text Data
              </Tab>
              <Tab
                className={({ selected }) =>
                  selected
                    ? "px-4 py-2 font-medium text-white bg-black rounded-t-md border border-gray-300 cursor-pointer"
                    : "px-4 py-2 font-medium text-black bg-gray-100 rounded-t-md hover:bg-gray-200 cursor-pointer"
                }
              >
                File & Image Data
              </Tab>
            </TabList>
            <TabPanels>
              {/* Text Data Tab */}
              <TabPanel className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="title"
                    placeholder="Title..."
                    className={`${inputClass}`}
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="type"
                    placeholder="Type..."
                    className={inputClass}
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="description"
                    placeholder="Description..."
                    className={inputClass}
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="citation"
                    placeholder="Citation..."
                    className={inputClass}
                    value={formData.citation}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    name="paperLink"
                    placeholder="Paper link..."
                    className={inputClass}
                    value={formData.paperLink}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="licensing"
                    placeholder="Licensing..."
                    className={inputClass}
                    value={formData.licensing}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="private"
                    checked={formData.private}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-900">Private</label>
                </div>
                <div>
                  <input
                    type="text"
                    name="authors"
                    placeholder="Authors (comma separated)..."
                    className={inputClass}
                    value={formData.authors}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="keywords"
                    placeholder="Keywords (comma separated)..."
                    className={inputClass}
                    value={formData.keywords}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="applications"
                    placeholder="Applications (comma separated)..."
                    className={inputClass}
                    value={formData.applications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setTabIndex(1)}
                    className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
                  >
                    Next
                  </button>
                </div>
              </TabPanel>

              {/* File & Image Data Tab */}
              <TabPanel className="space-y-6">
                {/* Images Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">Images</h2>
                  <FileInputWithDescription
                    label="Image"
                    onAdd={handleAddImage}
                  />
                  <ul className="mt-2 space-y-1">
                    {imageRelations.map((image) => (
                      <RelationItem
                        key={image.imageName}
                        item={image}
                        onDelete={handleImageDelete}
                        onEdit={handleImageEdit}
                        nameKey="imageName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">Files</h2>
                  <FileInputWithDescription
                    label="File"
                    onAdd={handleAddFile}
                  />
                  <ul className="mt-2 space-y-1">
                    {fileRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={handleFileDelete}
                        onEdit={handleFileEdit}
                        nameKey="fileName"
                      />
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setTabIndex(0)}
                    className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 ml-2"
                  >
                    Submit Structure
                  </button>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </form>
      </div>

      {/* Modal for Submission Feedback */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="rounded-lg max-w-md w-full p-6 bg-white">
              <DialogTitle className="text-lg font-medium text-gray-900">
                Submission Status
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-600">{responseMessage}</p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <p>Loading...</p>
  );
}
