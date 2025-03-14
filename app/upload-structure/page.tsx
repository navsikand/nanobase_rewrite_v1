"use client";

import { useState } from "react";
import { Dialog, DialogTitle, Transition } from "@headlessui/react";
import { z } from "zod";
import { apiRoot } from "@/helpers/fetchHelpers";

enum StructureTypes {
  DNA = "DNA",
  RNA = "RNA",
  DNA_RNA_HYBRID = "DNA/RNA hybrid",
  NUCLEIC_ACID_PROTEIN_HYBRID = "Nucleic acid/protein hybrid",
}

const PropsPrismaCreateStructureSchema = z.object({
  title: z.string().nonempty("Title is required"),
  type: z.nativeEnum(StructureTypes).or(z.string()),
  description: z.string().nonempty("Description is required"),
  datePublished: z.string().date(),
  citation: z.string(),
  paperLink: z.string(),
  licensing: z.string().nonempty("Licensing is required"),
  private: z.boolean(),

  applications: z.array(
    z.string().nonempty("Applications cannot have empty strings")
  ),
  authors: z.array(z.string().nonempty("Authors cannot have empty strings")),
});

type FormData = z.infer<typeof PropsPrismaCreateStructureSchema>;

export default function UploadStructurePage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: StructureTypes.DNA,
    description: "",
    datePublished: "",
    citation: "",
    paperLink: "",
    licensing: "",
    private: false,
    applications: [],
    authors: [],
  });

  const [keywords, setKeywords] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Narrow down the type
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File[]>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setter(Array.from(e.target.files));
      }
    };

  const validateForm = () => {
    try {
      PropsPrismaCreateStructureSchema.parse({
        ...formData,
        applications: formData.applications.filter((app) => app.trim() !== ""),
        authors: formData.authors.filter((auth) => auth.trim() !== ""),
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const validationErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            validationErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const requestData = {
      ...formData,
      keywords: keywords.split(",").map((kw) => kw.trim()),
    };

    const formDataToSend = new FormData();
    Object.keys(requestData).forEach((key) => {
      const value = requestData[key as keyof typeof requestData];
      if (typeof value === "boolean") {
        formDataToSend.append(key, value ? "true" : "false");
      } else if (Array.isArray(value)) {
        value.forEach((item) => formDataToSend.append(key, item));
      } else {
        formDataToSend.append(key, value);
      }
    });

    images.forEach((image) => formDataToSend.append("images", image));
    files.forEach((file) => formDataToSend.append("files", file));

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiRoot}/structure/createStructure`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Attach token here
        },

        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to upload structure");
      }

      const data = await response.json();
      setResponseMessage(data.message || "Structure uploaded successfully!");
    } catch (error) {
      setResponseMessage(
        (error as { message: string }).message ||
          "An error occurred while uploading."
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Structure
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              placeholder="Title..."
              //className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              //  errors.title ? "border-red-500" : ""
              //}`}

              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.title ? "border-red-500" : ""}`}
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
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.type ? "border-red-500" : ""}`}
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
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.description ? "border-red-500" : ""}`}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              name="datePublished"
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.datePublished ? "border-red-500" : ""}`}
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
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.citation ? "border-red-500" : ""}`}
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
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.paperLink ? "border-red-500" : ""}`}
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
              className={`bg-stone-400/20 rounded-lg p-2 w-full mt-1 ${errors.licensing ? "border-red-500" : ""}`}
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
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full p-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-stone-400/20 rounded-lg"
              onChange={handleFileChange(setImages)}
            />
          </div>

          {/* Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Files
            </label>
            <input
              type="file"
              multiple
              className="w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-stone-400/20 rounded-lg p-2"
              onChange={handleFileChange(setFiles)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end ">
            <button
              type="submit"
              className={
                "rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer cursor-pointer"
              }
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Structure"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal for Success/Error Messages */}
      <Transition appear show={isModalOpen} as="div">
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="rounded-lg shadow-lg max-w-md w-full p-6">
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
