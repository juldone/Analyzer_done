import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loginWithUser } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "";
        const response = await axios.get(`${apiUrl}/auth/verify/${token}`, {
          withCredentials: true,
        });

        if (response.data.user) {
          loginWithUser(response.data.user);
        }

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errMsg = axiosError.response?.data?.message || "Verification failed. The link may be invalid or expired.";
        setStatus("error");
        setMessage(errMsg);
      }
    };

    verifyEmail();
  }, [token, navigate, loginWithUser]);

  const renderIcon = () => {
    if (status === "loading") {
      return <Loader size={48} className="text-primary-500 animate-spin" />;
    }
    if (status === "success") {
      return <CheckCircle size={32} className="text-success-500" />;
    }
    return <XCircle size={32} className="text-error-500" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full bg-dark-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-opacity-20"
               style={{ backgroundColor: status === "success" ? "#22c55e" : status === "error" ? "#ef4444" : "transparent" }}>
            {renderIcon()}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {status === "loading"
              ? "Verifying Email"
              : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
          </h1>

          <p className="text-gray-300 mb-8">{message}</p>

          {status === "success" && (
            <Button variant="primary" onClick={() => navigate("/dashboard")}>
              Weiter zum Dashboard
            </Button>
          )}

          {status === "error" && (
            <Button variant="outline" onClick={() => navigate("/")}>
              Zurück zur Startseite
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
