import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, AlertCircle } from "lucide-react";
import Button from "../components/Button";
import { AxiosError } from "axios";

const TwoFactorPage: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    verify2FA,
    needsTwoFactor,
    twoFactorMethod,
    isAuthenticated,
    clearTwoFactorState,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !needsTwoFactor) {
      navigate("/dashboard");
    }

    if (!needsTwoFactor) {
      navigate("/login");
    }
  }, [isAuthenticated, needsTwoFactor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      await verify2FA(code);
      navigate("/dashboard");
    } catch (err: unknown) {
      // Typprüfung für AxiosError
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr.response?.data?.message || "Invalid code. Please try again."
        );
      } else {
        setError("Invalid code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    clearTwoFactorState();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full bg-dark-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mb-6 mx-auto w-16 h-16 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield size={32} className="text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-400 mt-2">
              {twoFactorMethod === "email"
                ? "Enter the 6-digit code sent to your email"
                : "Enter the 6-digit code from your authenticator app"}
            </p>
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
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Authentication Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="bg-dark-700 block w-full px-3 py-2 border border-dark-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-white text-center tracking-widest text-xl"
                  placeholder="000000"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Verify
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Cancel and return to login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorPage;
