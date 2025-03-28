"use client";

import { useState, ChangeEvent, FormEvent, Fragment } from "react";
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
import { apiRoot } from "@/helpers/fetchHelpers";

// Type for each file entry (file and its description)
export interface FileEntry {
  file: File;
  description: string;
}

// Props for the FileInputWithDescription component.
interface FileInputWithDescriptionProps {
  label: string;
  onAdd: (entry: FileEntry) => void;
}

// A reusable component for adding a single file with its description.
function FileInputWithDescription({
  label,
  onAdd,
}: FileInputWithDescriptionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAdd = () => {
    if (file) {
      if (!description.trim()) {
        setError("Description is required.");
        return;
      }
      onAdd({ file, description });
      // Reset the inputs for the next entry.
      setFile(null);
      setDescription("");
      setError("");
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
        onChange={(e) => {
          setDescription(e.target.value);
          if (e.target.value.trim()) setError("");
        }}
        className="mt-1 block p-2 border rounded"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
      >
        Add File
      </button>
    </div>
  );
}

// New component to display each file entry with edit and delete options.
interface FileEntryItemProps {
  index: number;
  entry: FileEntry;
  onDelete: (index: number) => void;
  onEdit: (index: number, newEntry: FileEntry) => void;
}

function FileEntryItem({ index, entry, onDelete, onEdit }: FileEntryItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>(
    entry.description
  );

  const handleSave = () => {
    // Create an updated entry with the new description.
    onEdit(index, { file: entry.file, description: editedDescription });
    setIsEditing(false);
  };

  return (
    <li className="flex items-center justify-between">
      <div>
        <span className="font-semibold">{entry.file.name}</span>
        {" - "}
        {isEditing ? (
          <input
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="p-1 border rounded"
          />
        ) : (
          <span>{entry.description}</span>
        )}
      </div>
      <div className="space-x-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-black cursor-pointer text-white rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 bg-black cursor-pointer text-white rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => onDelete(index)}
          className="px-2 py-1 bg-black cursor-pointer text-white rounded"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

// Interface for the main form state.
interface FormDataState {
  title: string;
  type: string;
  description: string;
  datePublished: string;
  authors: string;
  applications: string;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;
  keywords: string;
}

export default function UploadStructure() {
  // Shared input styling for consistency.
  const inputClass =
    "w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1";

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    type: "",
    description: "",
    datePublished: "",
    citation: "",
    applications: "",
    authors: "",
    paperLink: "",
    licensing: "",
    keywords: "",
    private: false,
  });

  // Options for the structure type
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

  // State for different file entries.
  const [images, setImages] = useState<FileEntry[]>([]);
  const [structureFiles, setStructureFiles] = useState<FileEntry[]>([]);
  const [simulationProtocolFiles, setSimulationProtocolFiles] = useState<
    FileEntry[]
  >([]);
  const [simulationResultFiles, setSimulationResultFiles] = useState<
    FileEntry[]
  >([]);
  const [experimentProtocolFiles, setExperimentProtocolFiles] = useState<
    FileEntry[]
  >([]);
  const [experimentResultFiles, setExperimentResultFiles] = useState<
    FileEntry[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Handler for regular input changes.
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Validation function to check required form fields.
  const validateFormData = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.type.trim()) newErrors.type = "Type is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.datePublished.trim())
      newErrors.datePublished = "Date published is required.";
    if (!formData.licensing.trim())
      newErrors.licensing = "Licensing is required.";
    return newErrors;
  };

  // Handlers for adding file entries.
  const addImage = (fileEntry: FileEntry) =>
    setImages((prev) => [...prev, fileEntry]);
  const addStructureFile = (fileEntry: FileEntry) =>
    setStructureFiles((prev) => [...prev, fileEntry]);
  const addSimProtFile = (fileEntry: FileEntry) =>
    setSimulationProtocolFiles((prev) => [...prev, fileEntry]);
  const addSimResFile = (fileEntry: FileEntry) =>
    setSimulationResultFiles((prev) => [...prev, fileEntry]);
  const addExpProtFile = (fileEntry: FileEntry) =>
    setExperimentProtocolFiles((prev) => [...prev, fileEntry]);
  const addExpResFile = (fileEntry: FileEntry) =>
    setExperimentResultFiles((prev) => [...prev, fileEntry]);

  // Generic deletion and edit handlers for a file list.
  const handleDelete = (
    index: number,
    listSetter: React.Dispatch<React.SetStateAction<FileEntry[]>>
  ) => {
    listSetter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (
    index: number,
    newEntry: FileEntry,
    listSetter: React.Dispatch<React.SetStateAction<FileEntry[]>>
  ) => {
    listSetter((prev) =>
      prev.map((entry, i) => (i === index ? newEntry : entry))
    );
  };

  // Form submission handler.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateFormData();
    // Validate that at least one image and one structure file are uploaded.
    if (images.length === 0) {
      validationErrors.images = "At least one image is required.";
    }
    if (structureFiles.length === 0) {
      validationErrors.structureFiles =
        "At least one structure file is required.";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    const requestData = { ...formData };
    const formDataToSend = new FormData();
    Object.keys(requestData).forEach((key) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      formDataToSend.append(key, (requestData as any)[key]);
    });

    // Helper function to append each file and its description.
    const appendFiles = (key: string, fileEntries: FileEntry[]) => {
      fileEntries.forEach(({ file, description }) => {
        formDataToSend.append(key, file);
        formDataToSend.append(`${key}Description`, description);
      });
    };

    appendFiles("images", images);
    appendFiles("structureFiles", structureFiles);
    appendFiles("simProtFiles", simulationProtocolFiles);
    appendFiles("simResFiles", simulationResultFiles);
    appendFiles("expProtFiles", experimentProtocolFiles);
    appendFiles("expResFiles", experimentResultFiles);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }
      const response = await fetch(`${apiRoot}/structure/createStructure`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorMsg = "Failed to upload structure.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          // Use default error message if parsing fails.
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Received invalid response from the server.");
      }
      setResponseMessage(data.message || "Structure uploaded successfully!");

      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      setResponseMessage(error.message || "An error occurred while uploading.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 bg-white">
        <h1 className="text-2xl font-bold mb-6">Upload Structure</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                Files
              </Tab>
            </TabList>
            <TabPanels>
              {/* Text Data Panel */}
              <TabPanel className={"space-y-1"}>
                <div>
                  <input
                    type="text"
                    name="title"
                    placeholder="Title..."
                    className={`${inputClass} ${errors.title ? "border-red-500" : ""}`}
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>
                <div>
                  <Listbox value={selectedType} onChange={handleTypeChange}>
                    <ListboxButton
                      className={`${inputClass} text-left ${errors.type ? "border-red-500" : ""}`}
                    >
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
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type}</p>
                  )}
                </div>
                <div>
                  <textarea
                    name="description"
                    placeholder="Description..."
                    className={`${inputClass} ${errors.description ? "border-red-500" : ""}`}
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>
                <div>
                  <input
                    type="date"
                    name="datePublished"
                    className={`${inputClass} ${errors.datePublished ? "border-red-500" : ""}`}
                    value={formData.datePublished}
                    onChange={handleChange}
                    required
                  />
                  {errors.datePublished && (
                    <p className="text-red-500 text-sm">
                      {errors.datePublished}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="citation"
                    placeholder="Citation..."
                    className={`${inputClass} ${errors.citation ? "border-red-500" : ""}`}
                    value={formData.citation}
                    onChange={handleChange}
                  />
                  {errors.citation && (
                    <p className="text-red-500 text-sm">{errors.citation}</p>
                  )}
                </div>
                <div>
                  <input
                    type="url"
                    name="paperLink"
                    placeholder="Paper link..."
                    className={`${inputClass} ${errors.paperLink ? "border-red-500" : ""}`}
                    value={formData.paperLink}
                    onChange={handleChange}
                  />
                  {errors.paperLink && (
                    <p className="text-red-500 text-sm">{errors.paperLink}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="licensing"
                    placeholder="Licensing..."
                    className={`${inputClass} ${errors.licensing ? "border-red-500" : ""}`}
                    value={formData.licensing}
                    onChange={handleChange}
                    required
                  />
                  {errors.licensing && (
                    <p className="text-red-500 text-sm">{errors.licensing}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Keywords (comma-separated)..."
                    name="keywords"
                    className={inputClass}
                    value={formData.keywords}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Applications (comma-separated)..."
                    name="applications"
                    className={inputClass}
                    value={formData.applications}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Authors (comma-separated)..."
                    name="authors"
                    className={inputClass}
                    value={formData.authors}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="private"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.private}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="private"
                    className="ml-2 text-sm text-gray-900"
                  >
                    Private
                  </label>
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

              {/* File Data Panel */}
              <TabPanel>
                <div className="space-y-6">
                  {/* Images */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">Images</h2>
                    <FileInputWithDescription
                      label="Add an Image:"
                      onAdd={addImage}
                    />
                    {errors.images && (
                      <p className="text-red-500 text-sm">{errors.images}</p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {images.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) => handleDelete(i, setImages)}
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setImages)
                          }
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Structure Files */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">
                      Structure and Design Files
                    </h2>
                    <FileInputWithDescription
                      label="Add a Structure File:"
                      onAdd={addStructureFile}
                    />
                    {errors.structureFiles && (
                      <p className="text-red-500 text-sm">
                        {errors.structureFiles}
                      </p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {structureFiles.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) => handleDelete(i, setStructureFiles)}
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setStructureFiles)
                          }
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Simulation Protocol Files */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">
                      Simulation Protocol Files
                    </h2>
                    <FileInputWithDescription
                      label="Add a Simulation Protocol File:"
                      onAdd={addSimProtFile}
                    />
                    <ul className="mt-2 space-y-1">
                      {simulationProtocolFiles.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) =>
                            handleDelete(i, setSimulationProtocolFiles)
                          }
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setSimulationProtocolFiles)
                          }
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Simulation Result Files */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">
                      Simulation Result Files
                    </h2>
                    <FileInputWithDescription
                      label="Add a Simulation Result File:"
                      onAdd={addSimResFile}
                    />
                    <ul className="mt-2 space-y-1">
                      {simulationResultFiles.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) =>
                            handleDelete(i, setSimulationResultFiles)
                          }
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setSimulationResultFiles)
                          }
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Experiment Protocol Files */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">
                      Experiment Protocol Files
                    </h2>
                    <FileInputWithDescription
                      label="Add an Experiment Protocol File:"
                      onAdd={addExpProtFile}
                    />
                    <ul className="mt-2 space-y-1">
                      {experimentProtocolFiles.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) =>
                            handleDelete(i, setExperimentProtocolFiles)
                          }
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setExperimentProtocolFiles)
                          }
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Experiment Result Files */}
                  <div className="border p-4 rounded-md">
                    <h2 className="font-semibold mb-2">
                      Experiment Result Files
                    </h2>
                    <FileInputWithDescription
                      label="Add an Experiment Result File:"
                      onAdd={addExpResFile}
                    />
                    <ul className="mt-2 space-y-1">
                      {experimentResultFiles.map((entry, index) => (
                        <FileEntryItem
                          key={index}
                          index={index}
                          entry={entry}
                          onDelete={(i) =>
                            handleDelete(i, setExperimentResultFiles)
                          }
                          onEdit={(i, newEntry) =>
                            handleEdit(i, newEntry, setExperimentResultFiles)
                          }
                        />
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "Uploading..." : "Upload Structure"}
                  </button>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </form>
      </div>

      {/* Modal for Success/Error Messages */}
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
                Upload Status
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
  );
}
