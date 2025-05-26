import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import {
  Camera,
  Calendar,
  Layers,
  Clock,
  FileText,
  ArrowLeft,
  Download,
  Upload,
  Settings,
  Loader,
  AlertCircle,
} from "lucide-react";
import Button from "../components/Button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "phosphor-react"; // bleibt für das "No Location Data" Icon

interface IconDefaultWithGetIconUrl extends L.Icon.Default {
  prototype: {
    _getIconUrl?: () => string;
  };
}

const iconDefault = L.Icon.Default as unknown as IconDefaultWithGetIconUrl;

if (iconDefault.prototype._getIconUrl) {
  delete iconDefault.prototype._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

interface MetadataItem {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  metadataRaw: { [key: string]: string | number };

  make: string | null;
  model: string | null;
  lens: string | null;
  width: number | null;
  height: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  creationDate: string | null;
  modificationDate: string | null;
  software: string | null;
  exposureTime: string | null;
  fNumber: number | null;
  iso: number | null;
  focalLength: number | null;
}

// Hole die API-URL aus Umgebungsvariablen
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

const MetadataPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [metadata, setMetadata] = useState<MetadataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const response = await axios.get<MetadataItem>(
          `${API_BASE_URL}/metadata/${id}`,
          { withCredentials: true } // Cookie-basierte Authentifizierung
        );
        setMetadata(response.data);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const message =
            err.response?.data?.message || "Failed to fetch metadata";
          setError(message);
          console.error("Axios error fetching metadata:", err);
        } else {
          setError("An unexpected error occurred");
          console.error("Unknown error fetching metadata:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMetadata();
    }
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatGPSCoordinate = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "Not available";
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="bg-dark-800 rounded-lg shadow-md p-8 text-center">
          <AlertCircle size={48} className="text-error-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Metadata</h1>
          <p className="text-gray-300 mb-6">{error || "Metadata not found"}</p>
          <Link to="/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <Link to="/history" className="text-gray-400 hover:text-white mr-4">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold truncate">
            {metadata.originalName}
          </h1>
          <p className="text-gray-400 text-sm">
            Uploaded on {new Date(metadata.uploadDate).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-800 rounded-t-lg overflow-hidden mb-px">
        <div className="flex border-b border-dark-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "overview"
                ? "border-b-2 border-primary-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <Layers size={18} className="mr-2" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("camera")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "camera"
                ? "border-b-2 border-primary-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <Camera size={18} className="mr-2" />
            Camera
          </button>

          <button
            onClick={() => setActiveTab("location")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "location"
                ? "border-b-2 border-primary-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <MapPin size={18} className="mr-2" />
            Location
          </button>

          <button
            onClick={() => setActiveTab("dates")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "dates"
                ? "border-b-2 border-primary-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <Calendar size={18} className="mr-2" />
            Date/Time
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "raw"
                ? "border-b-2 border-primary-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <FileText size={18} className="mr-2" />
            Raw Data
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-dark-800 rounded-b-lg shadow-md p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">File Information</h2>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Filename</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.originalName}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">File Type</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.fileType}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">File Size</td>
                      <td className="py-3 font-medium text-right">
                        {formatFileSize(metadata.fileSize)}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Dimensions</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.width && metadata.height
                          ? `${metadata.width} × ${metadata.height}`
                          : "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Software</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.software || "Not available"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Key Findings</h2>

                <div className="space-y-6">
                  <div className="bg-dark-700 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Camera size={20} className="text-primary-500 mr-2" />
                      <h3 className="font-medium">Camera</h3>
                    </div>
                    <p className="text-gray-300">
                      {metadata.make && metadata.model
                        ? `${metadata.make} ${metadata.model}`
                        : "No camera information found"}
                    </p>
                  </div>

                  <div className="bg-dark-700 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <MapPin size={20} className="text-primary-500 mr-2" />
                      <h3 className="font-medium">Location</h3>
                    </div>
                    <p className="text-gray-300">
                      {metadata.latitude && metadata.longitude
                        ? formatGPSCoordinate(
                            metadata.latitude,
                            metadata.longitude
                          )
                        : "No location data found"}
                    </p>
                  </div>

                  <div className="bg-dark-700 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Clock size={20} className="text-primary-500 mr-2" />
                      <h3 className="font-medium">Created</h3>
                    </div>
                    <p className="text-gray-300">
                      {metadata.creationDate
                        ? new Date(metadata.creationDate).toLocaleString()
                        : "No creation date found"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 space-x-4">
              <Button
                variant="outline"
                icon={<Download size={18} />}
                onClick={() => {
                  // Download metadata as JSON
                  const dataStr =
                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(metadata, null, 2));
                  const downloadAnchorNode = document.createElement("a");
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute(
                    "download",
                    `${metadata.originalName}-metadata.json`
                  );
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                Export Metadata
              </Button>
            </div>
          </div>
        )}

        {/* Camera Tab */}
        {activeTab === "camera" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Camera Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-accent-500">
                  Camera Details
                </h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Make</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.make || "Not available"}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Model</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.model || "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Lens</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.lens || "Not available"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-accent-500">
                  Exposure Settings
                </h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Exposure Time</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.exposureTime || "Not available"}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">F Number</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.fNumber
                          ? `f/${metadata.fNumber}`
                          : "Not available"}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">ISO</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.iso || "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Focal Length</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.focalLength
                          ? `${metadata.focalLength}mm`
                          : "Not available"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-dark-700 p-5 rounded-md">
              <h3 className="text-lg font-medium mb-3">
                OSINT Analysis: Camera Information
              </h3>
              <p className="text-gray-300">
                {metadata.make && metadata.model ? (
                  <>
                    This image was taken with a{" "}
                    <strong>
                      {metadata.make} {metadata.model}
                    </strong>{" "}
                    camera
                    {metadata.lens ? ` using a ${metadata.lens} lens` : ""}.
                    {metadata.exposureTime && metadata.fNumber && metadata.iso
                      ? ` The exposure settings (${metadata.exposureTime}, f/${
                          metadata.fNumber
                        }, ISO ${metadata.iso}) 
                       ${
                         metadata.focalLength
                           ? `and focal length of ${metadata.focalLength}mm`
                           : ""
                       } 
                       suggest ${
                         metadata.iso > 800
                           ? "low light conditions"
                           : "good lighting conditions"
                       }.`
                      : ""}
                  </>
                ) : (
                  "No camera information was found in this image. This could indicate that the metadata was stripped or that the device used does not record this information."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === "location" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Location Information</h2>

            {metadata.latitude && metadata.longitude ? (
              <>
                <div className="mb-6">
                  <div className="bg-dark-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium mb-3 text-accent-500">
                      GPS Coordinates
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-dark-600 px-4 py-2 rounded-md">
                        <span className="text-sm text-gray-400">Latitude</span>
                        <p className="font-mono text-lg">
                          {metadata.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="bg-dark-600 px-4 py-2 rounded-md">
                        <span className="text-sm text-gray-400">Longitude</span>
                        <p className="font-mono text-lg">
                          {metadata.longitude.toFixed(6)}
                        </p>
                      </div>
                      {metadata.altitude !== null && (
                        <div className="bg-dark-600 px-4 py-2 rounded-md">
                          <span className="text-sm text-gray-400">
                            Altitude
                          </span>
                          <p className="font-mono text-lg">
                            {metadata.altitude.toFixed(1)} m
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Leaflet Map */}
                  <div className="bg-dark-700 rounded-lg overflow-hidden h-64">
                    <MapContainer
                      center={[metadata.latitude, metadata.longitude]}
                      zoom={13}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[metadata.latitude, metadata.longitude]}
                      >
                        <Popup>
                          {`Photo Location: (${metadata.latitude.toFixed(
                            6
                          )}, ${metadata.longitude.toFixed(6)})`}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                <div className="mt-8 bg-dark-700 p-5 rounded-md">
                  <h3 className="text-lg font-medium mb-3">
                    OSINT Analysis: Location Data
                  </h3>
                  <p className="text-gray-300">
                    This image contains precise GPS coordinates (
                    {metadata.latitude.toFixed(6)},{" "}
                    {metadata.longitude.toFixed(6)})
                    {metadata.altitude !== null
                      ? ` at an altitude of ${metadata.altitude.toFixed(
                          1
                        )} meters`
                      : ""}
                    . This location data can be used to determine exactly where
                    the photo was taken, which may reveal information about the
                    photographer's movements or location patterns.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-dark-700 p-6 rounded-lg text-center">
                <MapPin size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Location Data Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  This image does not contain GPS coordinates or location
                  information. This could be because location services were
                  disabled when the photo was taken, or the metadata has been
                  stripped for privacy reasons.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dates Tab */}
        {activeTab === "dates" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">
              Date & Time Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-accent-500">
                  Timestamp Details
                </h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Creation Date</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.creationDate
                          ? new Date(metadata.creationDate).toLocaleString()
                          : "Not available"}
                      </td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-3 text-gray-400">Modification Date</td>
                      <td className="py-3 font-medium text-right">
                        {metadata.modificationDate
                          ? new Date(metadata.modificationDate).toLocaleString()
                          : "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Upload Date</td>
                      <td className="py-3 font-medium text-right">
                        {new Date(metadata.uploadDate).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-accent-500">
                  Timeline Analysis
                </h3>
                {metadata.creationDate || metadata.modificationDate ? (
                  <div className="space-y-4">
                    {metadata.creationDate && (
                      <div className="bg-dark-700 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Calendar
                              size={18}
                              className="text-primary-500 mr-2"
                            />
                            <span>Created</span>
                          </div>
                          <span className="text-sm font-mono">
                            {new Date(metadata.creationDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {metadata.modificationDate && (
                      <div className="bg-dark-700 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Settings
                              size={18}
                              className="text-primary-500 mr-2"
                            />
                            <span>Modified</span>
                          </div>
                          <span className="text-sm font-mono">
                            {new Date(
                              metadata.modificationDate
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-dark-700 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Upload size={18} className="text-primary-500 mr-2" />
                          <span>Uploaded</span>
                        </div>
                        <span className="text-sm font-mono">
                          {new Date(metadata.uploadDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark-700 p-4 rounded-md text-gray-400">
                    No creation or modification dates found in this image.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 bg-dark-700 p-5 rounded-md">
              <h3 className="text-lg font-medium mb-3">
                OSINT Analysis: Temporal Data
              </h3>
              <p className="text-gray-300">
                {metadata.creationDate ? (
                  <>
                    This image was created on{" "}
                    {new Date(metadata.creationDate).toLocaleDateString()}
                    at {new Date(metadata.creationDate).toLocaleTimeString()}.
                    {metadata.modificationDate &&
                      (metadata.creationDate !== metadata.modificationDate
                        ? ` It was later modified on ${new Date(
                            metadata.modificationDate
                          ).toLocaleDateString()} 
                         at ${new Date(
                           metadata.modificationDate
                         ).toLocaleTimeString()}, which indicates 
                         the image was edited after it was taken.`
                        : " The modification date matches the creation date, suggesting no post-processing.")}
                    {metadata.software &&
                      ` The software used was ${metadata.software}.`}
                  </>
                ) : (
                  "This image does not contain creation date information, which could indicate metadata has been stripped or modified."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Raw Data Tab */}
        {activeTab === "raw" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
              <span>Raw Metadata</span>
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
                onClick={() => {
                  // Download raw metadata as JSON
                  const dataStr =
                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(
                      JSON.stringify(metadata.metadataRaw, null, 2)
                    );
                  const downloadAnchorNode = document.createElement("a");
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute(
                    "download",
                    `${metadata.originalName}-raw-metadata.json`
                  );
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                Export Raw Data
              </Button>
            </h2>

            <div className="bg-dark-900 rounded-lg p-4 overflow-auto max-h-[60vh]">
              <pre className="text-gray-300 font-mono text-sm">
                {JSON.stringify(metadata.metadataRaw, null, 2)}
              </pre>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Note: This is the complete, unprocessed metadata extracted from
              the image. Some fields may contain technical information or appear
              differently than in the formatted views.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataPage;
