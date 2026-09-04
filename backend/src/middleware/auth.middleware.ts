import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Verify JWT Token Middleware
export const verifyToken = async (req, res, next) => {
	try {
		const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			return res.status(401).json({ success: false, message: "Session expired or not found. Please log in again." });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
		}
		
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(401).json({ success: false, message: "User not found. Please log in again." });
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
		}
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
		}
		console.error("Error in verifyToken:", error.message);
		return res.status(500).json({ success: false, message: "Authentication error. Please try again." });
	}
};

// Check if user is ADMIN
export const verifyAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ success: false, message: "Forbidden - Admins only" });
	}
	next();
};

// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
// 	const token = req.cookies.token;
// 	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
// 	try {
// 		const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

// 		req.userId = decoded.userId;
// 		next();
// 	} catch (error) {
// 		console.log("Error in verifyToken ", error);
// 		return res.status(500).json({ success: false, message: "Server error" });
// 	}
// };