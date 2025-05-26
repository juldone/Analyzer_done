import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileSearch, Shield, Database, Lock } from 'lucide-react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-accent-500">OSINT</span>
            <span className="text-2xl font-semibold">Metadata</span>
          </Link>
          
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Advanced <span className="text-accent-500">Image Analysis</span> for Security Professionals
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Extract and analyze metadata from digital images to reveal hidden information like location data, camera details, and more. All with enterprise-grade security.
            </p>
            <div className="flex justify-center space-x-6">
              {isAuthenticated ? (
                <Link to="/upload">
                  <Button variant="secondary" size="lg">
                    Upload an Image
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="secondary" size="lg">
                    Get Started Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
            <div className="bg-dark-800 p-8 rounded-lg border border-dark-700 transform transition-transform hover:scale-105">
              <div className="bg-primary-500 bg-opacity-20 p-4 inline-block rounded-lg mb-6">
                <FileSearch size={32} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Complete Metadata Extraction</h2>
              <p className="text-gray-300">
                Extract EXIF, IPTC, and XMP data from images, revealing camera details, location coordinates, timestamps, and software information.
              </p>
            </div>
            
            <div className="bg-dark-800 p-8 rounded-lg border border-dark-700 transform transition-transform hover:scale-105">
              <div className="bg-accent-500 bg-opacity-20 p-4 inline-block rounded-lg mb-6">
                <Shield size={32} className="text-accent-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Enhanced Security</h2>
              <p className="text-gray-300">
                Secure your analysis with two-factor authentication, JWT token-based sessions, and encrypted data storage.
              </p>
            </div>
            
            <div className="bg-dark-800 p-8 rounded-lg border border-dark-700 transform transition-transform hover:scale-105">
              <div className="bg-primary-500 bg-opacity-20 p-4 inline-block rounded-lg mb-6">
                <Database size={32} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Historical Analysis</h2>
              <p className="text-gray-300">
                Track your upload history and maintain a searchable database of all extracted metadata for future reference.
              </p>
            </div>
            
            <div className="bg-dark-800 p-8 rounded-lg border border-dark-700 transform transition-transform hover:scale-105">
              <div className="bg-accent-500 bg-opacity-20 p-4 inline-block rounded-lg mb-6">
                <Lock size={32} className="text-accent-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Privacy-First Approach</h2>
              <p className="text-gray-300">
                Your uploaded images are never permanently stored. We only extract and store the metadata for your analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Uncover Hidden Image Data?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of security professionals and researchers who use our platform for digital forensics and OSINT operations.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"}>
            <Button variant="secondary" size="lg">
              {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-10 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-accent-500">OSINT</span>
              <span className="text-xl font-semibold text-white"> Metadata Analyzer</span>
              <p className="text-gray-400 mt-2">© 2025 All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;