"use client";

import { getStructureByIdFetcher } from "@/helpers/fetchHelpers";
import { use, useEffect, useState, ChangeEvent } from "react";
import useSWR from "swr";

type FormData = {
  title: string;
  type: string;
  description: string;
  citation: string;
  paperLink: string;
  licensing: string;
  private: boolean;
  authors: string; // comma separated string
  keywords: string; // comma separated string
  applications: string; // comma separated string
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

// Generic component for displaying and editing a relation (file or image)
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
    <div className="mb-2 border border-gray-300 p-2 rounded">
      <strong>{itemName}</strong>:{" "}
      {isEditing ? (
        <>
          <input
            type="text"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
          />
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <span>{item.description}</span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
          >
            Edit
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => onDelete(itemName)}
        className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
      >
        Delete
      </button>
    </div>
  );
};

// Generic input component for adding a file (or image) with a description.
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
        className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
      >
        Add {label}
      </button>
    </div>
  );
}

export default function EditStructurePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id: structureId } = use(params);

  const { data: server_structureData } = useSWR(
    structureId ? ["getStructureById", structureId] : null,
    ([key, id]) => getStructureByIdFetcher(key, id)
  );

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    description: "",
    citation: "",
    paperLink: "",
    licensing: "",
    private: false,
    authors: "",
    keywords: "",
    applications: "",
  });

  // State for file and image relations
  const [fileRelations, setFileRelations] = useState<FileRelation[]>([]);
  const [imageRelations, setImageRelations] = useState<ImageRelation[]>([]);

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
        private: true,
      });

      setImageRelations(server_structureData.structure.imageNameToDescRelation);
      setFileRelations(server_structureData.structure.fileNameToDescRelation);
    }
  }, [server_structureData]);

  // Update formData when any input changes.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Delete functions for file and image relations
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

  // Edit functions for file and image relations
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

  // Handlers for adding new files and images using the FileInputWithDescription component.
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

  // Dummy handleSubmit function with validations
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validate text fields (title, type, description, citation, paperLink, licensing, authors, keywords, applications)
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        errors.push(`The field "${key}" is required.`);
      }
    });

    // Validate paperLink is a valid URL
    try {
      new URL(formData.paperLink);
    } catch {
      errors.push("Paper Link must be a valid URL.");
    }

    // Validate at least one image and one file exists
    if (imageRelations.length < 1) {
      errors.push("At least one image is required.");
    }
    if (fileRelations.length < 1) {
      errors.push("At least one file is required.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
    } else {
      // Dummy submission - replace with actual submit logic
      console.log("Form submitted successfully!", {
        formData,
        fileRelations,
        imageRelations,
      });
      alert("Form submitted successfully!");
    }
  };

  return server_structureData ? (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6">Edit Structure</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title:
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Type:
            </label>
            <input
              name="type"
              type="text"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description:
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Citation:
            </label>
            <input
              name="citation"
              type="text"
              value={formData.citation}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Paper Link:
            </label>
            <input
              name="paperLink"
              type="text"
              value={formData.paperLink}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Licensing:
            </label>
            <input
              name="licensing"
              type="text"
              value={formData.licensing}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">
              Private:
            </label>
            <input
              name="private"
              type="checkbox"
              checked={formData.private}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Authors (comma separated):
            </label>
            <input
              name="authors"
              type="text"
              value={formData.authors}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Keywords (comma separated):
            </label>
            <input
              name="keywords"
              type="text"
              value={formData.keywords}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Applications (comma separated):
            </label>
            <input
              name="applications"
              type="text"
              value={formData.applications}
              onChange={handleInputChange}
              className="w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2 rounded-lg bg-stone-400/20 mt-1"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
          >
            Submit Structure
          </button>
        </form>

        {/* Section for adding new images */}
        <h2 className="text-2xl font-bold mt-6 mb-4">Add New Image</h2>
        <FileInputWithDescription label="Image" onAdd={handleAddImage} />
        {imageRelations.map((image) => (
          <RelationItem
            key={image.imageName}
            item={image}
            onDelete={handleImageDelete}
            onEdit={handleImageEdit}
            nameKey="imageName"
          />
        ))}

        {/* Section for adding new files */}
        <h2 className="text-2xl font-bold mt-6 mb-4">Add New File</h2>
        <FileInputWithDescription label="File" onAdd={handleAddFile} />
        {fileRelations.map((file) => (
          <RelationItem
            key={file.fileName}
            item={file}
            onDelete={handleFileDelete}
            onEdit={handleFileEdit}
            nameKey="fileName"
          />
        ))}
      </div>
    </div>
  ) : (
    <p>Loading</p>
  );
}
