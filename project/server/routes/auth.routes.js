import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  verify2FA,
  setup2FA,
  enable2FA,
  disable2FA,
  logoutUser,
  getUserProfile,
  requestPasswordReset, // ← NEU
  resetPassword, // ← Entfernt, da noch nicht implementiert
} from "../../misc/old/auth.controller.js"; // Stelle sicher, dass requestPasswordReset dort implementiert ist
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/verify-2fa", verify2FA);
router.post("/request-password-reset", requestPasswordReset); // ← NEU
router.post("/reset-password", resetPassword); // ← Entfernt, da noch nicht implementiert

// Protected routes
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getUserProfile);
router.post("/setup-2fa", protect, setup2FA);
router.post("/enable-2fa", protect, enable2FA);
router.post("/disable-2fa", protect, disable2FA);

export default router;
