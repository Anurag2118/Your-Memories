import express from "express";
import { UserModel } from "../models/Users.js";
import { MemoryModel } from "../models/memories.js";
import { verifyToken } from "./users.js"; // Ensure this path is correct relative to memories.js

const router = express.Router();

// GET all memories
router.get("/", async (req, res) => {
    try {
        const response = await MemoryModel.find({});
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new memory (requires token)
router.post("/", verifyToken, async (req, res) => {
    // Ensure the userOwner is the authenticated user from the token
    // This is safer than relying on req.body.userOwner from the frontend
    const memory = new MemoryModel({
        ...req.body,
        userOwner: req.userID // Use the userID from the verified token
    });
    try {
        const response = await memory.save();
        res.status(201).json(response); // 201 Created
    } catch (err) {
        console.error("Error creating memory:", err); // Log the error for debugging
        res.status(500).json({ message: err.message });
    }
});

// PUT (save) a memory for a user (requires token)
router.put("/", verifyToken, async (req, res) => {
    const { memoryID } = req.body; // Only need memoryID, userID comes from token
    const userID = req.userID; // Get userID from the authenticated token

    try {
        // Find the memory by its ID
        const memory = await MemoryModel.findById(memoryID);

        // Find the user by their ID
        const user = await UserModel.findById(userID);

        // Check if both memory and user were found
        if (!memory) {
            return res.status(404).json({ message: "Memory not found." });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Add the memory's ID to the user's savedMemories array if it's not already there
        if (!user.savedMemories.includes(memoryID)) {
            user.savedMemories.push(memory._id);
            await user.save(); // Save the updated user document
        }

        // Respond with the updated list of saved memory IDs from the user document
        res.json({ savedMemories: user.savedMemories });

    } catch (err) {
        console.error("Error saving memory on backend:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET IDs of saved memories for a specific user
// Note: This route doesn't use verifyToken as it's intended to get public saved IDs.
// If you want to restrict this to the *current* user, add verifyToken and use req.userID.
router.get("/savedMemories/ids/:userID", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userID);
        res.json({ savedMemories: user?.savedMemories || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET the full saved memories documents for a specific user
// Note: Similar to the above, add verifyToken if you want to restrict this.
router.get("/savedMemories/:userID", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const savedMemories = await MemoryModel.find({
            _id: { $in: user.savedMemories },
        });
        res.json({ savedMemories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export { router as memoriesRouter };