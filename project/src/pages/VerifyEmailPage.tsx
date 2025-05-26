import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loginWithUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Deine E-Mail wird überprüft...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Ungültiger Bestätigungslink.");
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/verify/${token}`,
          { withCredentials: true }
        );

        loginWithUser(data.user);
        setMessage(data.message || "E-Mail erfolgreich verifiziert!");
        setStatus("success");

        setTimeout(() => navigate("/dashboard"), 2000);
      } catch (err: unknown) {
        let msg =
          "Überprüfung fehlgeschlagen. Der Link ist ungültig oder abgelaufen.";

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: unknown }).response === "object" &&
          (err as { response?: { data?: unknown } }).response !== null &&
          "data" in (err as { response: { data?: unknown } }).response &&
          typeof (err as { response: { data?: { message?: string } } }).response
            .data === "object" &&
          (err as { response: { data?: { message?: string } } }).response
            .data !== null &&
          "message" in
            (err as { response: { data: { message?: string } } }).response
              .data &&
          typeof (err as { response: { data: { message?: string } } }).response
            .data.message === "string"
        ) {
          msg = (err as { response: { data: { message: string } } }).response
            .data.message;
        }

        setStatus("error");
        setMessage(msg);
      }
    };

    verify();
  }, [token, navigate, loginWithUser]);

  const Icon =
    status === "loading" ? (
      <Loader className="animate-spin text-primary-500" size={48} />
    ) : status === "success" ? (
      <CheckCircle className="text-green-500" size={32} />
    ) : (
      <XCircle className="text-red-500" size={32} />
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="bg-dark-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">{Icon}</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          {status === "loading"
            ? "E-Mail wird geprüft..."
            : status === "success"
            ? "Erfolg!"
            : "Fehler"}
        </h1>
        <p className="text-gray-300 mb-6">{message}</p>
        {status === "success" && (
          <Button variant="primary" onClick={() => navigate("/dashboard")}>
            Zum Dashboard
          </Button>
        )}
        {status === "error" && (
          <Button variant="outline" onClick={() => navigate("/")}>
            Zurück zur Startseite
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
