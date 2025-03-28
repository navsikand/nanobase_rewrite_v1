"use client";

import { apiRoot, getUserStructureByIdFetcher } from "@/helpers/fetchHelpers";
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
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

// --- Types ---
type FormDataType = {
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

// Extend relation types to include the file object if a new file is added.
type FileRelation = {
  fileName: string;
  description: string;
  file?: File;
};

type ImageRelation = {
  imageName: string;
  description: string;
  file?: File;
};

type RelationItemProps = {
  item: { description: string; [key: string]: string | File | undefined };
  onDelete: (name: string) => void;
  onEdit: (name: string, newDescription: string) => void;
  nameKey: string;
};

// --- RelationItem Component ---
const RelationItem = ({
  item,
  onDelete,
  onEdit,
  nameKey,
}: RelationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(
    item.description as string
  );
  const itemName = item[nameKey] as string;

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

  const [formData, setFormData] = useState<FormDataType>({
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

  const typeOptions = [
    "DNA",
    "RNA",
    "DNA/RNA hybrid",
    "Nucleic acid/protein hybrid",
    "Other",
  ];

  // State for the selected type; defaults to the first option.
  const [selectedType, setSelectedType] = useState<string>(typeOptions[0]);

  // Update formData when the type is changed.
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setFormData((prev) => ({ ...prev, type: value }));
  };

  // New states for the updated file arrays.
  const [imageRelations, setImageRelations] = useState<ImageRelation[]>([]);
  const [expProtRelations, setExpProtRelations] = useState<FileRelation[]>([]);
  const [expResRelations, setExpResRelations] = useState<FileRelation[]>([]);
  const [simProtRelations, setSimProtRelations] = useState<FileRelation[]>([]);
  const [simResRelations, setSimResRelations] = useState<FileRelation[]>([]);
  const [structureFilesRelations, setStructureFilesRelations] = useState<
    FileRelation[]
  >([]);

  // For tab switching.
  const [tabIndex, setTabIndex] = useState(0);

  // Modal for submission feedback.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    if (server_structureData) {
      // Populate text fields – converting arrays into comma-separated strings.
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

      // Populate file relations from the new arrays in the schema.
      setImageRelations(
        server_structureData.structure.imagesArr.map(
          (name: string, idx: number) => ({
            imageName: name,
            description:
              server_structureData.structure.imageDescriptionsArr[idx] || "",
          })
        )
      );
      setExpProtRelations(
        server_structureData.structure.expProtFilesArr.map(
          (name: string, idx: number) => ({
            fileName: name,
            description:
              server_structureData.structure.expProtDescriptionsArr[idx] || "",
          })
        )
      );
      setExpResRelations(
        server_structureData.structure.expResFilesArr.map(
          (name: string, idx: number) => ({
            fileName: name,
            description:
              server_structureData.structure.expResDescriptionsArr[idx] || "",
          })
        )
      );
      setSimProtRelations(
        server_structureData.structure.simProtFilesArr.map(
          (name: string, idx: number) => ({
            fileName: name,
            description:
              server_structureData.structure.simProtDescriptionsArr[idx] || "",
          })
        )
      );
      setSimResRelations(
        server_structureData.structure.simResFilesArr.map(
          (name: string, idx: number) => ({
            fileName: name,
            description:
              server_structureData.structure.simResDescriptionsArr[idx] || "",
          })
        )
      );
      setStructureFilesRelations(
        server_structureData.structure.structureFilesArr.map(
          (name: string, idx: number) => ({
            fileName: name,
            description:
              server_structureData.structure.structureFileDescriptionsArr[
                idx
              ] || "",
          })
        )
      );
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

  // Handlers for relations – file & image.
  const handleFileDelete = (
    fileName: string,
    setter: (relations: FileRelation[]) => void,
    relations: FileRelation[]
  ) => {
    setter(relations.filter((file) => file.fileName !== fileName));
  };

  const handleFileEdit = (
    fileName: string,
    newDescription: string,
    setter: (relations: FileRelation[]) => void,
    relations: FileRelation[]
  ) => {
    setter(
      relations.map((file) =>
        file.fileName === fileName
          ? { ...file, description: newDescription }
          : file
      )
    );
  };

  const handleImageDelete = (imageName: string) => {
    setImageRelations(
      imageRelations.filter((img) => img.imageName !== imageName)
    );
  };

  const handleImageEdit = (imageName: string, newDescription: string) => {
    setImageRelations(
      imageRelations.map((img) =>
        img.imageName === imageName
          ? { ...img, description: newDescription }
          : img
      )
    );
  };

  // Handlers for adding new items.
  const handleAddFile = (
    item: { file: File; description: string },
    setter: (relations: FileRelation[]) => void,
    relations: FileRelation[]
  ) => {
    setter([
      ...relations,
      {
        fileName: item.file.name,
        description: item.description,
        file: item.file,
      },
    ]);
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
      { imageName: file.name, description, file },
    ]);
  };

  // Updated handleSubmit: sends file objects when available, as in the upload page.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validate required text fields.
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        errors.push(`The field "${key}" is required.`);
      }
    });

    // Validate paperLink URL.
    try {
      new URL(formData.paperLink);
    } catch {
      errors.push("Paper Link must be a valid URL.");
    }

    // Ensure at least one image is provided.
    if (imageRelations.length < 1) {
      errors.push("At least one image is required.");
    }

    if (errors.length > 0) {
      setResponseMessage("Submission failed:\n" + errors.join("\n"));
      setIsModalOpen(true);
      return;
    }

    // Create FormData for submission.
    const data = new FormData();
    data.append("id", structureId.toString());
    data.append("title", formData.title);
    data.append("type", formData.type);
    data.append("description", formData.description);
    data.append("citation", formData.citation);
    data.append("paperLink", formData.paperLink);
    data.append("licensing", formData.licensing);
    data.append("private", formData.private.toString());
    data.append(
      "datePublished",
      new Date(server_structureData!.structure.datePublished).toISOString()
    );
    data.append("authors", formData.authors);
    data.append("keywords", formData.keywords);
    data.append("applications", formData.applications);
    data.append("imagesArr", imageRelations.map((i) => i.imageName).join(","));
    data.append(
      "expProtFilesArr",
      expProtRelations.map((i) => i.fileName).join(",")
    );
    data.append(
      "expResFilesArr",
      expResRelations.map((i) => i.fileName).join(",")
    );
    data.append(
      "simProtFilesArr",
      simProtRelations.map((i) => i.fileName).join(",")
    );
    data.append(
      "simResFilesArr",
      simResRelations.map((i) => i.fileName).join(",")
    );
    data.append(
      "structureFilesArr",
      structureFilesRelations.map((i) => i.fileName).join(",")
    );

    data.append(
      "imageDescriptionsArr",
      imageRelations.map((i) => i.description).join(",")
    );
    data.append(
      "expProtDescriptionsArr",
      expProtRelations.map((i) => i.description).join(",")
    );
    data.append(
      "expResDescriptionsArr",
      expResRelations.map((i) => i.description).join(",")
    );
    data.append(
      "simProtDescriptionsArr",
      simProtRelations.map((i) => i.description).join(",")
    );
    data.append(
      "simResDescriptionsArr",
      simResRelations.map((i) => i.description).join(",")
    );
    data.append(
      "structureDescriptionsArr",
      structureFilesRelations.map((i) => i.description).join(",")
    );

    // Helper function to append each file and its description, same as upload page.
    const appendFiles = (
      key: string,
      fileEntries: { file?: File; description: string }[]
    ) => {
      fileEntries.forEach(({ file, description }) => {
        if (file) {
          // Only append if a new file is present.
          data.append(key, file);
          data.append(`${key}Description`, description);
        }
      });
    };

    // Use the same keys as in the upload page.
    appendFiles("images", imageRelations);
    appendFiles("structureFiles", structureFilesRelations);
    appendFiles("simProtFiles", simProtRelations);
    appendFiles("simResFiles", simResRelations);
    appendFiles("expProtFiles", expProtRelations);
    appendFiles("expResFiles", expResRelations);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const res = await fetch(`${apiRoot}/structure/updateStructureById`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server responded with an error.");
      }

      const resJson = await res.json();
      if (resJson.success) {
        setResponseMessage("Structure updated successfully!");
      } else {
        setResponseMessage("Update failed: " + resJson.error);
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      setResponseMessage(
        "An error occurred while updating the structure: " + error.message
      );
    }
    setIsModalOpen(true);
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
                Metadata
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
                    className={inputClass}
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Listbox value={selectedType} onChange={handleTypeChange}>
                    <ListboxButton className={`${inputClass} text-left`}>
                      {selectedType}
                    </ListboxButton>
                    <ListboxOptions className="mt-1 border rounded bg-white">
                      {typeOptions.map((option) => (
                        <ListboxOption
                          key={option}
                          value={option}
                          className={({ selected }) =>
                            `cursor-pointer p-2 ${selected ? "bg-gray-200" : ""}`
                          }
                        >
                          {option}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Listbox>
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
                    {imageRelations.map((img) => (
                      <RelationItem
                        key={img.imageName}
                        item={img}
                        onDelete={handleImageDelete}
                        onEdit={handleImageEdit}
                        nameKey="imageName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Experiment Protocol Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">
                    Experiment Protocol Files
                  </h2>
                  <FileInputWithDescription
                    label="Experiment Protocol File"
                    onAdd={(item) =>
                      handleAddFile(item, setExpProtRelations, expProtRelations)
                    }
                  />
                  <ul className="mt-2 space-y-1">
                    {expProtRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={(name) =>
                          handleFileDelete(
                            name,
                            setExpProtRelations,
                            expProtRelations
                          )
                        }
                        onEdit={(name, newDesc) =>
                          handleFileEdit(
                            name,
                            newDesc,
                            setExpProtRelations,
                            expProtRelations
                          )
                        }
                        nameKey="fileName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Experiment Result Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">
                    Experiment Result Files
                  </h2>
                  <FileInputWithDescription
                    label="Experiment Result File"
                    onAdd={(item) =>
                      handleAddFile(item, setExpResRelations, expResRelations)
                    }
                  />
                  <ul className="mt-2 space-y-1">
                    {expResRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={(name) =>
                          handleFileDelete(
                            name,
                            setExpResRelations,
                            expResRelations
                          )
                        }
                        onEdit={(name, newDesc) =>
                          handleFileEdit(
                            name,
                            newDesc,
                            setExpResRelations,
                            expResRelations
                          )
                        }
                        nameKey="fileName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Simulation Protocol Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">
                    Simulation Protocol Files
                  </h2>
                  <FileInputWithDescription
                    label="Simulation Protocol File"
                    onAdd={(item) =>
                      handleAddFile(item, setSimProtRelations, simProtRelations)
                    }
                  />
                  <ul className="mt-2 space-y-1">
                    {simProtRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={(name) =>
                          handleFileDelete(
                            name,
                            setSimProtRelations,
                            simProtRelations
                          )
                        }
                        onEdit={(name, newDesc) =>
                          handleFileEdit(
                            name,
                            newDesc,
                            setSimProtRelations,
                            simProtRelations
                          )
                        }
                        nameKey="fileName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Simulation Result Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">
                    Simulation Result Files
                  </h2>
                  <FileInputWithDescription
                    label="Simulation Result File"
                    onAdd={(item) =>
                      handleAddFile(item, setSimResRelations, simResRelations)
                    }
                  />
                  <ul className="mt-2 space-y-1">
                    {simResRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={(name) =>
                          handleFileDelete(
                            name,
                            setSimResRelations,
                            simResRelations
                          )
                        }
                        onEdit={(name, newDesc) =>
                          handleFileEdit(
                            name,
                            newDesc,
                            setSimResRelations,
                            simResRelations
                          )
                        }
                        nameKey="fileName"
                      />
                    ))}
                  </ul>
                </div>

                {/* Structure Files Section */}
                <div className="border p-4 rounded-md">
                  <h2 className="font-semibold mb-2">
                    Structure and Design Files
                  </h2>
                  <FileInputWithDescription
                    label="Structure and Design File"
                    onAdd={(item) =>
                      handleAddFile(
                        item,
                        setStructureFilesRelations,
                        structureFilesRelations
                      )
                    }
                  />
                  <ul className="mt-2 space-y-1">
                    {structureFilesRelations.map((file) => (
                      <RelationItem
                        key={file.fileName}
                        item={file}
                        onDelete={(name) =>
                          handleFileDelete(
                            name,
                            setStructureFilesRelations,
                            structureFilesRelations
                          )
                        }
                        onEdit={(name, newDesc) =>
                          handleFileEdit(
                            name,
                            newDesc,
                            setStructureFilesRelations,
                            structureFilesRelations
                          )
                        }
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
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {responseMessage}
              </p>
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
