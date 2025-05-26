import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Home, Upload, History, User, LogOut } from "lucide-react";

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/upload", label: "Upload Image", icon: <Upload size={20} /> },
    { path: "/history", label: "History", icon: <History size={20} /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-800 text-gray-100">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 py-4 px-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-accent-500">OSINT</span>
            <span className="text-xl font-semibold">Metadata</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:bg-dark-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:bg-dark-700"
                }`}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
                <span>{user?.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-gray-300 hover:bg-dark-700 rounded-md transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-dark-800 border-b border-dark-700 animate-fade-in">
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-3 ${
                  location.pathname === item.path
                    ? "bg-primary-500 text-white rounded-md"
                    : "text-gray-300 border-b border-dark-700 last:border-0"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile Profile Section */}
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-3 ${
                location.pathname === "/profile"
                  ? "bg-primary-500 text-white rounded-md"
                  : "text-gray-300 border-b border-dark-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
              <span>{user?.username}</span>
            </Link>

            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-3 text-gray-300 border-t border-dark-700"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 text-center py-4 text-sm text-gray-500">
        <p>© 2025 OSINT Metadata Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
