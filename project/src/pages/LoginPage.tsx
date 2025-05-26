import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Button from "../components/Button";

// Hole die API-URL aus Umgebungsvariablen
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const { login, isAuthenticated, needsTwoFactor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else if (needsTwoFactor) {
      navigate("/two-factor");
    }
  }, [isAuthenticated, needsTwoFactor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorObj = err as AxiosErrorLike;
      setError(
        errorObj.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // JWT-Cookie, falls vorhanden, mitsenden
        body: JSON.stringify({ email: resetEmail }),
      });
      setResetSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as AxiosErrorLike;
      setError(
        errorObj.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="max-w-md w-full bg-dark-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center mb-6">
                <span className="text-2xl font-bold text-accent-500">
                  OSINT
                </span>
                <span className="text-2xl font-semibold text-white">
                  {" "}
                  Metadata
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-gray-400 mt-2">
                Enter your email to receive reset instructions
              </p>
            </div>

            {error && (
              <div className="bg-error-500 bg-opacity-10 border border-error-500 text-error-500 px-4 py-3 rounded-md flex items-start mb-6 animate-fade-in">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="text-center">
                <div className="bg-success-500 bg-opacity-10 border border-success-500 text-success-500 px-4 py-3 rounded-md mb-6">
                  Check your email for password reset instructions.
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowResetForm(false)}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-500" />
                      </div>
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="bg-dark-700 block w-full pl-10 pr-3 py-2 border border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-white"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      className="flex-1"
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full bg-dark-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center mb-6">
              <span className="text-2xl font-bold text-accent-500">OSINT</span>
              <span className="text-2xl font-semibold text-white">
                {" "}
                Metadata
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-error-500 bg-opacity-10 border border-error-500 text-error-500 px-4 py-3 rounded-md flex items-start mb-6 animate-fade-in">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-dark-700 block w-full pl-10 pr-3 py-2 border border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-dark-700 block w-full pl-10 pr-3 py-2 border border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-accent-500 hover:text-accent-400"
                >
                  Forgot password?
                </button>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-accent-500 hover:text-accent-400 font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
