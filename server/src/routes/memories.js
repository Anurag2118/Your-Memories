import express from "express";
import { UserModel } from "../models/Users.js";
import { MemoryModel } from "../models/memories.js";
import { verifyToken } from "./users.js";

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
    const memory = new MemoryModel({
        ...req.body,
        userOwner: req.userID
    });
    try {
        const response = await memory.save();
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT to toggle saving a memory (requires token)
router.put("/", verifyToken, async (req, res) => {
    const { memoryID } = req.body;
    const userID = req.userID;

    try {
        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const isSaved = user.savedMemories.some(savedId => savedId.toString() === memoryID);

        if (isSaved) {
            // If already saved, remove it
            await UserModel.updateOne({ _id: userID }, { $pull: { savedMemories: memoryID } });
        } else {
            // If not saved, add it
            await UserModel.updateOne({ _id: userID }, { $push: { savedMemories: memoryID } });
        }

        const updatedUser = await UserModel.findById(userID);
        res.json({ savedMemories: updatedUser.savedMemories });

    } catch (err) {
        console.error("Error in PUT /memories:", err);
        res.status(500).json({ message: "Server error while updating saved memories." });
    }
});

// GET IDs of saved memories for a specific user
router.get("/savedMemories/ids/:userID", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userID);
        res.json({ savedMemories: user?.savedMemories || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET the full saved memories documents for a specific user
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