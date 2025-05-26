import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
} from "lucide-react";
import Button from "../components/Button";

type SetupMethod = "app" | "email";

interface Setup2FAResponse {
  qrCodeUrl: string;
  secret: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [setupMethod, setSetupMethod] = useState<SetupMethod | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:5000/api";

  const setup2FA = async (method: SetupMethod) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setQrCodeUrl(null);
    setSecret(null);

    try {
      const response = await axios.post<Setup2FAResponse>(
        `${API_BASE_URL}/auth/setup-2fa`,
        { method },
        { withCredentials: true }
      );

      if (method === "app") {
        setQrCodeUrl(response.data.qrCodeUrl);
        setSecret(response.data.secret);
      }

      setSetupMethod(method);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      console.error("2FA setup error:", axiosErr.response?.data || axiosErr);
      setError(axiosErr.response?.data?.message || "Failed to set up 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const enable2FA = async () => {
    if (!setupMethod) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        `${API_BASE_URL}/auth/enable-2fa`,
        {
          code,
          method: setupMethod,
        },
        { withCredentials: true }
      );

      setSuccess("Two-factor authentication has been enabled successfully");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      console.error("Enable 2FA error:", axiosErr.response?.data || axiosErr);
      setError(axiosErr.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        `${API_BASE_URL}/auth/disable-2fa`,
        {},
        { withCredentials: true }
      );

      setSuccess("Two-factor authentication has been disabled");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      console.error("Disable 2FA error:", axiosErr.response?.data || axiosErr);
      setError(axiosErr.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-400">
          Manage your account and security preferences
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-dark-700 border-b border-dark-600">
          <h2 className="text-xl font-semibold">Account Information</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                  <User size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.username}</h3>
                  <p className="text-gray-400 mt-1">Username</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-accent-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail size={24} className="text-accent-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.email}</h3>
                  <p className="text-gray-400 mt-1">Email Address</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-700 p-4 rounded-md">
              <h3 className="font-medium mb-3">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-success-500 bg-opacity-20 flex items-center justify-center mr-3">
                    <CheckCircle size={18} className="text-success-500" />
                  </div>
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-400">
                      Your email address has been confirmed
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {user?.twoFactorEnabled ? (
                    <div className="w-8 h-8 rounded-full bg-success-500 bg-opacity-20 flex items-center justify-center mr-3">
                      <CheckCircle size={18} className="text-success-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-warning-500 bg-opacity-20 flex items-center justify-center mr-3">
                      <XCircle size={18} className="text-warning-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">
                      {user?.twoFactorEnabled
                        ? `Enabled (${
                            user?.twoFactorMethod === "app"
                              ? "Authenticator App"
                              : "Email"
                          })`
                        : "Not enabled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-dark-700 border-b border-dark-600">
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-error-500 bg-opacity-10 border border-error-500 text-error-500 px-4 py-3 rounded-md flex items-start mb-6 animate-fade-in">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-success-500 bg-opacity-10 border border-success-500 text-success-500 px-4 py-3 rounded-md flex items-start mb-6 animate-fade-in">
              <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-dark-700 p-6 rounded-lg mb-6">
            <div className="flex items-center mb-4">
              <Shield size={24} className="text-primary-500 mr-3" />
              <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Add an extra layer of security to your account by enabling
              two-factor authentication. When enabled, you'll be required to
              enter a verification code along with your password when logging
              in.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="text-primary-500 animate-spin" />
              </div>
            ) : user?.twoFactorEnabled ? (
              <div>
                <div className="bg-dark-600 p-4 rounded-md mb-6">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={18} className="text-success-500 mr-2" />
                    <p className="font-medium">
                      Two-factor authentication is enabled
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Method:{" "}
                    {user?.twoFactorMethod === "app"
                      ? "Authenticator App"
                      : "Email"}
                  </p>
                </div>

                <Button
                  variant="danger"
                  onClick={disable2FA}
                  isLoading={isLoading}
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            ) : setupMethod ? (
              <div className="animate-fade-in">
                <h4 className="font-medium mb-3">
                  {setupMethod === "app"
                    ? "Set up Authenticator App"
                    : "Set up Email 2FA"}
                </h4>

                {setupMethod === "app" && qrCodeUrl && (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      Scan this QR code with your authenticator app or enter the
                      code manually:
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="bg-white p-4 rounded-md">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code for 2FA"
                          className="w-48 h-48"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">
                          Manual entry code:
                        </p>
                        <div className="bg-dark-600 p-3 rounded font-mono mb-4 text-center">
                          {secret}
                        </div>
                        <p className="text-sm text-gray-400">
                          Enter this code in your authenticator app if you can't
                          scan the QR code.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {setupMethod === "email" && (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      A verification code will be sent to your email address (
                      {user?.email}) each time you log in.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label
                    htmlFor="verification-code"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Enter verification code to confirm setup
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-dark-600 border border-dark-500 rounded-md px-3 py-2 w-full md:w-64 text-white"
                    placeholder="000000"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {setupMethod === "app"
                      ? "Enter the 6-digit code from your authenticator app"
                      : "Enter the 6-digit code sent to your email"}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setSetupMethod(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={enable2FA}
                    disabled={code.length !== 6}
                    isLoading={isLoading}
                  >
                    Confirm and Enable
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-4">
                  Choose a two-factor authentication method:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setup2FA("app")}
                    className="bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-lg p-4 text-left transition-colors"
                  >
                    <h4 className="font-medium mb-2">Authenticator App</h4>
                    <p className="text-sm text-gray-400">
                      Use an authenticator app like Google Authenticator, Authy,
                      or Microsoft Authenticator
                    </p>
                  </button>

                  <button
                    onClick={() => setup2FA("email")}
                    className="bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-lg p-4 text-left transition-colors"
                  >
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-sm text-gray-400">
                      Receive a verification code via email each time you log in
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
