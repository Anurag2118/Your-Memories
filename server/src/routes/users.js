import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (user){
        return res.json({message: "User already exists!"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({username, password: hashedPassword});
    await newUser.save();

    res.json({message: "User registered Successfully!"});
});

// Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
        return res.status(400).json({ message: "User does not exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, userID: user._id });
});

export { router as userRouter };

export const verifyToken = (req, res, next) => {
    let token = req.headers.authorization; // Get the full Authorization header value

    // Check if token header is provided
    if (!token) {
        console.warn("VerifyToken: No Authorization header provided.");
        return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    // Check if it starts with "Bearer " and strip the prefix
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length); // Remove "Bearer " (7 characters)
    } else {
        // This case means a token was provided but not in the expected "Bearer <token>" format.
        console.warn("VerifyToken: Token provided but not in 'Bearer <token>' format.");
        return res.status(401).json({ message: "Unauthorized: Invalid token format." });
    }

    // Verify the JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Log the specific error from JWT verification for debugging on Render logs
            console.error("JWT Verification Failed:", err.message);
            // 403 Forbidden is appropriate for an invalid (e.g., tampered, expired) token
            return res.status(403).json({ message: `Forbidden: Token is invalid or expired. Detail: ${err.message}` });
        }

        // Attach the decoded user ID to the request object
        // This makes the user's ID available in subsequent middleware and route handlers
        req.userID = decoded.id; // Assuming your JWT payload has an 'id' field

        next(); // Token is valid, proceed to the next middleware/route
    });
};