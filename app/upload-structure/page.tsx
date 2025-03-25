"use client";

import { useState, ChangeEvent, FormEvent, Fragment } from "react";
import { Dialog, DialogTitle, Transition } from "@headlessui/react";
import { apiRoot } from "@/helpers/fetchHelpers";

// Type for each file entry (file and its description)
interface FileEntry {
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

  const handleAdd = () => {
    if (file) {
      onAdd({ file, description });
      // Reset the inputs for the next entry.
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
        className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded"
      >
        Add File
      </button>
    </div>
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
  // Form data state.
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

  // Handler for regular input changes with a type guard.
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

  // Validation function to check required fields.
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
    // Add additional validations as needed
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

  // Form submission handler.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data
    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    const requestData = {
      ...formData,
    };

    const formDataToSend = new FormData();
    Object.keys(requestData).forEach((key) => {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
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

      // Attempt to parse the error response if not OK
      if (!response.ok) {
        let errorMsg = "Failed to upload structure.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          // If parsing fails, keep the default error message.
        }
        throw new Error(errorMsg);
      }

      // If response is OK, parse the response data.
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Received invalid response from the server.");
      }
      setResponseMessage(data.message || "Structure uploaded successfully!");
      /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      setResponseMessage(error.message || "An error occurred while uploading.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 bg-white shadow">
        <h1 className="text-2xl font-bold mb-6">Upload Structure</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              placeholder="Title..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.title ? "border-red-500" : ""
              }`}
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <input
              type="text"
              name="type"
              placeholder="Type..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.type ? "border-red-500" : ""
              }`}
              value={formData.type}
              onChange={handleChange}
              required
            />
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <textarea
              name="description"
              placeholder="Description..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.description ? "border-red-500" : ""
              }`}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Date Published */}
          <div>
            <input
              type="date"
              name="datePublished"
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.datePublished ? "border-red-500" : ""
              }`}
              value={formData.datePublished}
              onChange={handleChange}
              required
            />
            {errors.datePublished && (
              <p className="text-red-500 text-sm">{errors.datePublished}</p>
            )}
          </div>

          {/* Citation */}
          <div>
            <input
              type="text"
              name="citation"
              placeholder="Citation..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.citation ? "border-red-500" : ""
              }`}
              value={formData.citation}
              onChange={handleChange}
            />
            {errors.citation && (
              <p className="text-red-500 text-sm">{errors.citation}</p>
            )}
          </div>

          {/* Paper Link */}
          <div>
            <input
              type="url"
              name="paperLink"
              placeholder="Paper link..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.paperLink ? "border-red-500" : ""
              }`}
              value={formData.paperLink}
              onChange={handleChange}
            />
            {errors.paperLink && (
              <p className="text-red-500 text-sm">{errors.paperLink}</p>
            )}
          </div>

          {/* Licensing */}
          <div>
            <input
              type="text"
              name="licensing"
              placeholder="Licensing..."
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${
                errors.licensing ? "border-red-500" : ""
              }`}
              value={formData.licensing}
              onChange={handleChange}
              required
            />
            {errors.licensing && (
              <p className="text-red-500 text-sm">{errors.licensing}</p>
            )}
          </div>

          {/* Private */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="private"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              checked={formData.private}
              onChange={handleChange}
            />
            <label htmlFor="private" className="ml-2 text-sm text-gray-900">
              Private
            </label>
          </div>

          {/* Keywords */}
          <div>
            <input
              type="text"
              placeholder="Keywords (comma-separated)..."
              className="w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>

          {/* Applications */}
          <div>
            <input
              type="text"
              placeholder="Keywords (comma-separated)..."
              className="w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20"
              name="applications"
              value={formData.applications}
              onChange={handleChange}
            />
          </div>

          {/* Authors */}
          <div>
            <input
              type="text"
              placeholder="Keywords (comma-separated)..."
              className="w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20"
              name="authors"
              value={formData.authors}
              onChange={handleChange}
            />
          </div>

          {/* Images */}
          <div>
            <h2 className="font-semibold">Images</h2>
            <FileInputWithDescription label="Add an Image:" onAdd={addImage} />
            <ul className="mt-2">
              {images.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Structure Files */}
          <div>
            <h2 className="font-semibold">Structure Files</h2>
            <FileInputWithDescription
              label="Add a Structure File:"
              onAdd={addStructureFile}
            />
            <ul className="mt-2">
              {structureFiles.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Simulation Protocol Files */}
          <div>
            <h2 className="font-semibold">Simulation Protocol Files</h2>
            <FileInputWithDescription
              label="Add a Simulation Protocol File:"
              onAdd={addSimProtFile}
            />
            <ul className="mt-2">
              {simulationProtocolFiles.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Simulation Result Files */}
          <div>
            <h2 className="font-semibold">Simulation Result Files</h2>
            <FileInputWithDescription
              label="Add a Simulation Result File:"
              onAdd={addSimResFile}
            />
            <ul className="mt-2">
              {simulationResultFiles.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Experiment Protocol Files */}
          <div>
            <h2 className="font-semibold">Experiment Protocol Files</h2>
            <FileInputWithDescription
              label="Add an Experiment Protocol File:"
              onAdd={addExpProtFile}
            />
            <ul className="mt-2">
              {experimentProtocolFiles.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Experiment Result Files */}
          <div>
            <h2 className="font-semibold">Experiment Result Files</h2>
            <FileInputWithDescription
              label="Add an Experiment Result File:"
              onAdd={addExpResFile}
            />
            <ul className="mt-2">
              {experimentResultFiles.map((entry, index) => (
                <li key={index}>
                  {entry.file.name} - {entry.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Structure"}
            </button>
          </div>
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
            <div className="rounded-lg shadow-lg max-w-md w-full p-6 bg-white">
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
