import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Upload,
  History,
  MapPin,
  Camera,
  Calendar,
  ArrowUpRight,
  Loader,
} from "lucide-react";
import Button from "../components/Button";

// Hole die API-URL aus Umgebungsvariablen
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL || // ← falls du CRA nutzt
  "http://localhost:5000/api"; // Fallback

interface MetadataStats {
  totalUploads: number;
  withGPS: number;
  cameraStats: Array<{ make: string; count: number }>;
}

interface RecentUpload {
  id: string;
  originalName: string;
  uploadDate: string;
  make: string | null;
  model: string | null;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MetadataStats | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await axios.get(
          `${API_BASE_URL}/metadata/stats`,
          {
            withCredentials: true, // Falls Auth mit Cookies
          }
        );
        setStats(statsResponse.data);

        // Fetch recent uploads
        const historyResponse = await axios.get(`${API_BASE_URL}/history`, {
          params: { limit: 5, page: 1 },
          withCredentials: true,
        });
        setRecentUploads(historyResponse.data.items);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.username}. Here's an overview of your metadata
          analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Uploads Stat */}
        <div className="bg-dark-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-300">Total Uploads</h2>
            <Upload size={24} className="text-primary-500" />
          </div>
          <p className="text-4xl font-bold">{stats?.totalUploads || 0}</p>
          <p className="text-gray-400 text-sm mt-2">Images analyzed</p>
        </div>

        {/* Images with GPS Stat */}
        <div className="bg-dark-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-300">With GPS Data</h2>
            <MapPin size={24} className="text-accent-500" />
          </div>
          <p className="text-4xl font-bold">{stats?.withGPS || 0}</p>
          <p className="text-gray-400 text-sm mt-2">
            {stats?.totalUploads
              ? ((stats.withGPS / stats.totalUploads) * 100).toFixed(1) + "%"
              : "0%"}{" "}
            of uploads
          </p>
        </div>

        {/* Top Camera */}
        <div className="bg-dark-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-300">Top Camera</h2>
            <Camera size={24} className="text-primary-500" />
          </div>
          <p className="text-4xl font-bold truncate">
            {stats?.cameraStats?.length ? stats.cameraStats[0].make : "N/A"}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {stats?.cameraStats?.length
              ? `${stats.cameraStats[0].count} images`
              : "No camera data yet"}
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-300">
              Recent Activity
            </h2>
            <Calendar size={24} className="text-accent-500" />
          </div>
          <p className="text-4xl font-bold">
            {Array.isArray(recentUploads) ? recentUploads.length : 0}
          </p>
          <p className="text-gray-400 text-sm mt-2">Recent uploads</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link to="/upload" className="flex-1">
          <Button variant="primary" fullWidth icon={<Upload size={18} />}>
            Upload New Image
          </Button>
        </Link>
        <Link to="/history" className="flex-1">
          <Button variant="outline" fullWidth icon={<History size={18} />}>
            View Full History
          </Button>
        </Link>
      </div>

      {/* Recent Uploads */}
      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold">Recent Uploads</h2>
        </div>

        {(recentUploads ?? []).length > 0 ? (
          <div className="divide-y divide-dark-700">
            {(recentUploads ?? []).map((upload) => (
              <div
                key={upload.id}
                className="px-6 py-4 hover:bg-dark-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium mb-1 truncate max-w-xs">
                      {upload.originalName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {upload.make && upload.model
                        ? `${upload.make} ${upload.model}`
                        : "No camera info"}
                      <span className="mx-2">•</span>
                      {new Date(upload.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/metadata/${upload.id}`}>
                    <button className="flex items-center text-accent-500 hover:text-accent-400">
                      View <ArrowUpRight size={16} className="ml-1" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 mb-4">No uploads yet</p>
            <Link to="/upload">
              <Button variant="primary" icon={<Upload size={18} />}>
                Upload Your First Image
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tips and Information */}
      <div className="bg-dark-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tips for OSINT Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">
              GPS Coordinates
            </h3>
            <p className="text-sm text-gray-300">
              GPS coordinates can reveal the exact location where a photo was
              taken. Check if an image has location data in the metadata to
              potentially identify shooting locations.
            </p>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">Timestamps</h3>
            <p className="text-sm text-gray-300">
              Original creation dates help establish chronology. Pay attention
              to timezone information, which can indicate the photographer's
              location when the image was taken.
            </p>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">
              Camera Information
            </h3>
            <p className="text-sm text-gray-300">
              Camera and lens details can help identify the photographer or
              establish patterns across multiple images. Professional equipment
              may suggest a professional photographer.
            </p>
          </div>

          <div className="bg-dark-700 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-accent-500">
              Software Fingerprints
            </h3>
            <p className="text-sm text-gray-300">
              Editing software information can reveal if an image has been
              modified. Multiple editing software entries might indicate
              manipulation or attempts to alter the original content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
