import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Search,
  FileImage,
  Trash2,
  ArrowRight,
  MapPin,
  Camera,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../components/Button";

// Hole die API-URL aus Umgebungsvariablen
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

interface HistoryItem {
  id: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  make: string | null;
  model: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface HistoryResponse {
  items: HistoryItem[];
  page: number;
  totalPages: number;
  totalItems: number;
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async (query: string = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = query
        ? `${API_BASE_URL}/history/search`
        : `${API_BASE_URL}/history`;
      const params = {
        page: currentPage,
        limit: 10,
        ...(query && { query }),
      };

      const response = await axios.get<HistoryResponse>(endpoint, {
        params,
        withCredentials: true,
      });
      setHistory(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error: unknown) {
      console.error("Error fetching history:", error);
      let message = "Failed to load history";
      if (axios.isAxiosError(error) && error.response) {
        message = error.response.data?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory(searchQuery);
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);

    try {
      await axios.delete(`${API_BASE_URL}/history`, {
        withCredentials: true,
      });
      setHistory([]);
      setTotalItems(0);
      setTotalPages(1);
      setShowDeleteConfirm(false);
    } catch (error: unknown) {
      console.error("Error deleting history:", error);
      let message = "Failed to delete history";
      if (axios.isAxiosError(error) && error.response) {
        message = error.response.data?.message || message;
      }
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Upload History</h1>
          <p className="text-gray-400">
            {totalItems} image{totalItems !== 1 ? "s" : ""} analyzed
          </p>
        </div>

        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="bg-dark-700 border border-dark-600 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </form>

          <Button
            variant="danger"
            icon={<Trash2 size={18} />}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!history || history.length === 0 || isDeleting}
          >
            Clear
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error-500 bg-opacity-10 border border-error-500 text-error-500 px-4 py-3 rounded-md flex items-start mb-6 animate-fade-in">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="text-primary-500 animate-spin" />
        </div>
      ) : history && history.length > 0 ? (
        <>
          <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Camera
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      GPS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileImage
                            size={20}
                            className="text-primary-500 mr-3"
                          />
                          <div>
                            <div className="font-medium truncate max-w-xs">
                              {item.originalName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatFileSize(item.fileSize)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar size={18} className="text-gray-500 mr-2" />
                          <span>{formatDate(item.uploadDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.make || item.model ? (
                          <div className="flex items-center text-gray-300">
                            <Camera size={18} className="text-gray-500 mr-2" />
                            <span className="truncate max-w-[150px]">
                              {[item.make, item.model]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.latitude && item.longitude ? (
                          <div className="flex items-center text-gray-300">
                            <MapPin size={18} className="text-gray-500 mr-2" />
                            <span>Available</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/metadata/${item.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ArrowRight size={16} />}
                          >
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalItems)} of {totalItems} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  icon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-dark-800 rounded-lg shadow-md p-8 text-center">
          <FileImage size={48} className="text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Upload History</h2>
          <p className="text-gray-400 mb-6">
            You haven't uploaded any images for metadata analysis yet.
          </p>
          <Link to="/upload">
            <Button variant="primary">Upload Your First Image</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Clear Upload History</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete all of your upload history and
                metadata? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAll}
                  isLoading={isDeleting}
                  icon={<Trash2 size={18} />}
                >
                  Delete All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
