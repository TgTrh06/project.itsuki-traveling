import jwt from 'jsonwebtoken';
import type { Response } from "express";
import { getEnv, isProduction } from "../config/env.js";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};

export const generateTokenAndSetCookie = (res: Response, userId: string) => {
    const token = jwt.sign({ userId }, getEnv().JWT_SECRET, {
        expiresIn: '7d', // Token valid for 7 days
    });

    res.cookie("token", token, cookieOptions);

    return token;
}

export const clearAuthCookie = (res: Response) => res.clearCookie("token", cookieOptions);
