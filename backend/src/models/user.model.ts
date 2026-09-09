import mongoose from "mongoose";
import type { UserFields } from "../types/models.js";

const userSchema = new mongoose.Schema<UserFields>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        avatar: {
            type: String
        },
        role: {
            type: String,
            enum: ['user', 'admin'] as const,
            default: 'user'
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        // isVerified: {
        //     type: Boolean,
        //     default: false
        // },
        // resetPasswordToken: String,
        // resetPasswordExpiresAt: Date,
        // verificationToken: String,
        // verificationTokenExpiresAt: Date,
    },
    { timestamps:true }
);

export const User = mongoose.model<UserFields>('User', userSchema);

