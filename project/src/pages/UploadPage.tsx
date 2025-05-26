import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Upload, AlertCircle } from "lucide-react";
import FileDropzone from "../components/FileDropzone";
import Button from "../components/Button";

// 👇 Hier API-Base-URL importieren aus Umgebungsvariablen
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
          );
          setUploadProgress(percentCompleted);
        },
        withCredentials: true, // falls dein Upload Authentifizierung benötigt
      });

      navigate(`/metadata/${response.data.metadata.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.error("Upload error:", axiosError);
      setError(
        axiosError.response?.data?.message ||
          "Failed to upload image. Please try again."
      );
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Image</h1>
        <p className="text-gray-400">
          Upload an image to extract and analyze its metadata
        </p>
      </div>

      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <FileDropzone onFileSelect={handleFileSelect} />

          {error && (
            <div className="mt-4 bg-error-500 bg-opacity-10 border border-error-500 text-error-500 px-4 py-3 rounded-md flex items-start animate-fade-in">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2.5">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              icon={isUploading ? undefined : <Upload size={18} />}
            >
              Upload and Analyze
            </Button>
          </div>
        </div>

        <div className="px-6 py-4 bg-dark-700 border-t border-dark-600">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Important Notes:
          </h3>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>
              Supported formats: JPG, PNG, TIFF, WebP, and other common image
              formats
            </li>
            <li>Maximum file size: 10MB</li>
            <li>
              Your images are not permanently stored, only the extracted
              metadata
            </li>
            <li>For privacy reasons, some image editors may strip metadata</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-dark-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          What metadata can be extracted?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">
              Camera Information
            </h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Camera make and model</li>
              <li>Lens type</li>
              <li>Aperture and exposure settings</li>
              <li>ISO speed</li>
            </ul>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">Location Data</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>GPS coordinates</li>
              <li>Altitude</li>
              <li>Direction (compass heading)</li>
              <li>Location accuracy</li>
            </ul>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">Date and Time</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Original creation date</li>
              <li>Digitization date</li>
              <li>Modification date</li>
              <li>Time zone information</li>
            </ul>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">
              Software Information
            </h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Software used to create/edit</li>
              <li>Original author</li>
              <li>Editing history</li>
              <li>Copyright information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
