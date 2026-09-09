import bcrypt from 'bcryptjs';
import type { Request, Response } from "express";
import { User } from '../models/user.model.js';
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail
} from '../mailtrap/email.js';
import { clearAuthCookie, generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { logger } from "../utils/logger.js";

const messageOf = (error: unknown) =>
    error instanceof Error ? error.message : "Unexpected error";

const asRecord = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

export const register = async (req: Request, res: Response) => {
    // Handle register logic
    try {
        const body = asRecord(req.body);
        const name = text(body.name);
        const email = text(body.email).toLowerCase();
        const password = text(body.password);

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Validate password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
        }

        // Check if user already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            // Privileged accounts are created through controlled seed/admin workflows only.
            role: 'user',
        });
        await user.save();

        // Generate JWT token
        generateTokenAndSetCookie(res, user._id.toString());

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        })
    } catch (error) {
        logger.warn("Registration failed", { error: messageOf(error) });
        res.status(400).json({ success: false, message: messageOf(error) });
    }
};

export const login = async (req: Request, res: Response) => {
    // Handle login logic
    try {
        const body = asRecord(req.body);
        const email = text(body.email).toLowerCase();
        const password = text(body.password);

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT token
        generateTokenAndSetCookie(res, user._id.toString());

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        logger.warn("Login failed", { error: messageOf(error) });
        res.status(400).json({ success: false, message: messageOf(error) });
    }
};

export const logout = async (_req: Request, res: Response) => {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Get current authenticated user
export const checkAuth = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                lastLogin: req.user.lastLogin,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        logger.warn("Authentication lookup failed", { error: messageOf(error) });
        res.status(400).json({ success: false, message: messageOf(error) });
    }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
        const body = asRecord(req.body);
        const name = text(body.name);
        const email = text(body.email).toLowerCase();
        const userId = req.user._id;

        // Validate input
        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required" });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        logger.warn("Profile update failed", { error: messageOf(error) });
        res.status(400).json({ success: false, message: messageOf(error) });
    }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
        const body = asRecord(req.body);
        const currentPassword = text(body.currentPassword);
        const newPassword = text(body.newPassword);
        const userId = req.user._id;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        logger.warn("Password change failed", { error: messageOf(error) });
        res.status(400).json({ success: false, message: messageOf(error) });
    }
};
