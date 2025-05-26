import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/User.js";
import {
  sendVerificationEmail,
  send2FACode,
  sendPasswordResetEmail,
} from "../utils/email.js";

// JWT erzeugen
const generateToken = (id, twoFactorVerified = false) =>
  jwt.sign({ id, twoFactorVerified }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

// Setzt JWT-Cookie
const setTokenCookie = (res, token) =>
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

// Registrierung
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ message: "User already exists" });

    const verificationToken =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      message: "Please verify your email.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// E-Mail-Verifizierung
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    const jwtToken = generateToken(user.id);
    setTokenCookie(res, jwtToken);

    res.status(200).json({
      message: "Email verified and logged in",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res
        .status(200)
        .json({ message: "Please verify your email", isVerified: false });

    if (user.twoFactorEnabled) {
      const tempToken = generateToken(user.id, false);

      if (user.twoFactorMethod === "email") {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorTempCode = code;
        await user.save();
        await send2FACode(user.email, code);
      }

      return res.status(200).json({
        message: "2FA required",
        requireTwoFactor: true,
        twoFactorMethod: user.twoFactorMethod,
        tempToken,
      });
    }

    const token = generateToken(user.id, true);
    setTokenCookie(res, token);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2FA-Verifizierung
export const verify2FA = async (req, res) => {
  try {
    const { code, tempToken } = req.body;
    if (!tempToken)
      return res.status(401).json({ message: "Authentication required" });

    const { id } = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let verified =
      user.twoFactorMethod === "app"
        ? speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: code,
            window: 1,
          })
        : code === user.twoFactorTempCode;

    if (!verified) return res.status(401).json({ message: "Invalid 2FA code" });

    user.twoFactorTempCode = null;
    await user.save();

    const token = generateToken(user.id, true);
    setTokenCookie(res, token);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2FA einrichten
export const setup2FA = async (req, res) => {
  try {
    const { method } = req.body;
    const user = await User.findByPk(req.user.id);

    if (method === "app") {
      const secret = speakeasy.generateSecret({ length: 20 });
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      user.twoFactorSecret = secret.base32;
      await user.save();
      return res.status(200).json({ secret: secret.base32, qrCodeUrl });
    }

    if (method === "email") {
      user.twoFactorMethod = "email";
      await user.save();
      return res.status(200).json({ message: "Email 2FA configured" });
    }

    res.status(400).json({ message: "Invalid 2FA method" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2FA aktivieren
export const enable2FA = async (req, res) => {
  try {
    const { code, method } = req.body;
    const user = await User.findByPk(req.user.id);

    const valid =
      method === "app"
        ? speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: code,
            window: 1,
          })
        : code.length === 6;

    if (!valid) return res.status(400).json({ message: "Invalid code" });

    user.twoFactorEnabled = true;
    user.twoFactorMethod = method;
    await user.save();

    res.status(200).json({ message: "2FA enabled", twoFactorEnabled: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2FA deaktivieren
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorMethod = null;
    await user.save();

    res.status(200).json({ message: "2FA disabled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Logout
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
};

// Profil anzeigen
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "twoFactorSecret"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Passwort-Reset anfordern
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Passwort zurücksetzen
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
