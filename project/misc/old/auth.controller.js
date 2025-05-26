import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../../server/models/User.js";
import {
  sendVerificationEmail,
  send2FACode,
} from "../../server/utils/email.js";
import { sendPasswordResetEmail } from "../../server/utils/email.js"; // Pfad ggf. anpassen
import { Op } from "sequelize";
import bcrypt from "bcrypt";

// Generate JWT
const generateToken = (id, twoFactorVerified = false) => {
  return jwt.sign({ id, twoFactorVerified }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
    });

    console.log("➡️ User created:", user.toJSON());

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("🔍 Eingehender Token:", token);

    let user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      // Token wurde schon verwendet? Versuche Benutzer über Email-Verifizierung zu finden
      user = await User.findOne({
        where: {
          isVerified: true,
        },
      });

      if (!user) {
        console.log(
          "❌ Kein Benutzer mit gültigem oder verwendetem Token gefunden."
        );
        return res.status(400).json({ message: "Invalid verification token" });
      }

      console.log("ℹ️ Benutzer ist bereits verifiziert:", user.email);
    } else {
      // Benutzer gefunden → verifizieren
      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      console.log("✅ Benutzer erfolgreich verifiziert:", user.email);
    }

    // JWT generieren
    const jwtToken = generateToken(user.id);

    // Cookie setzen
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    });

    return res.status(200).json({
      message: user.isVerified
        ? "Email verified and user logged in successfully."
        : "Email was already verified. Logged in again.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error) {
    console.error("❗ Verify email error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Benutzer anhand Email suchen
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Keine Fehlermeldung mit genauen Gründen aus Sicherheitsgründen (keine Info, ob Email existiert)
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Passwort validieren
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Prüfen, ob Email verifiziert ist
    if (!user.isVerified) {
      // Aktuell wird hier 401 gesendet - das führt zu deinem Problem mit Frontend-Login
      // Empfehlung: Statt 401 kannst du hier 200 senden, mit einem Flag, das anzeigt,
      // dass Email noch nicht verifiziert wurde. So wird Login im Frontend akzeptiert.
      // Beispiel:
      return res.status(200).json({
        message: "Please verify your email before logging in",
        isVerified: false,
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    }

    // 2FA prüfen
    if (user.twoFactorEnabled) {
      const tempToken = generateToken(user.id, false);

      if (user.twoFactorMethod === "email") {
        const twoFactorCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        user.twoFactorTempCode = twoFactorCode;
        await user.save();

        await send2FACode(user.email, twoFactorCode);

        return res.status(200).json({
          message: "2FA code sent to your email",
          requireTwoFactor: true,
          twoFactorMethod: "email",
          twoFactorEnabled: true,
          tempToken,
        });
      } else {
        // 2FA über App (z.B. Google Authenticator)
        return res.status(200).json({
          message: "Please enter your authenticator code",
          requireTwoFactor: true,
          twoFactorMethod: "app",
          twoFactorEnabled: true,
          tempToken,
        });
      }
    }

    // Generiere JWT Token für eingeloggten User
    const token = generateToken(user.id, true);

    // Setze Cookie (secure nur im Prod-Modus)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    });

    // Sende User-Daten zurück an Frontend
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify 2FA code
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = async (req, res) => {
  try {
    const { code, tempToken } = req.body;

    if (!tempToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let verified = false;

    if (user.twoFactorMethod === "app") {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });
    } else if (user.twoFactorMethod === "email") {
      verified = user.twoFactorTempCode === code;
    }

    if (!verified) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    user.twoFactorTempCode = null;
    await user.save();

    const token = generateToken(user.id, true);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Set up 2FA
// @route   POST /api/auth/setup-2fa
// @access  Private
export const setup2FA = async (req, res) => {
  try {
    const { method } = req.body;

    if (!["app", "email"].includes(method)) {
      return res.status(400).json({ message: "Invalid 2FA method" });
    }

    const user = await User.findByPk(req.user.id);

    if (method === "app") {
      const secret = speakeasy.generateSecret({ length: 20 });
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      user.twoFactorSecret = secret.base32;
      await user.save();

      return res.status(200).json({
        secret: secret.base32,
        qrCodeUrl,
      });
    } else if (method === "email") {
      user.twoFactorMethod = "email";
      await user.save();

      return res.status(200).json({
        message: "Email 2FA method set up. Verification required.",
      });
    }
  } catch (error) {
    console.error("Setup 2FA error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/enable-2fa
// @access  Private
export const enable2FA = async (req, res) => {
  try {
    const { code, method } = req.body;
    const user = await User.findByPk(req.user.id);

    let verified = false;

    if (method === "app") {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });
    } else if (method === "email") {
      verified = code.length === 6;
    }

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.twoFactorEnabled = true;
    user.twoFactorMethod = method;
    await user.save();

    res.status(200).json({
      message: "2FA enabled successfully",
      twoFactorEnabled: true,
      twoFactorMethod: method,
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorMethod = null;
    await user.save();

    res.status(200).json({
      message: "2FA disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "twoFactorSecret"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/reset-password
// @access  Public
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Stunde gültig
    await user.save();

    // Sende Reset-Link über separate email.js Utility
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({ message: "Password reset link sent." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }, // Token darf nicht abgelaufen sein
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Neues Passwort hashen
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Token löschen
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
