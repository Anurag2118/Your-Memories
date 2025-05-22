import express from "express";
import { UserModel } from "../models/Users.js"; // Make sure this path is correct
import { MemoryModel } from "../models/memories.js"; // Make sure this path is correct
import { verifyToken } from "./users.js"; // Make sure this path is correct

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
  const memory = new MemoryModel(req.body);
  try {
    const response = await memory.save();
    res.status(201).json(response); // 201 Created
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (save) a memory for a user (requires token)
router.put("/", verifyToken, async (req, res) => {
  const { memoryID, userID } = req.body; // Destructure memoryID and userID from the request body

  try {
    // Find the memory by its ID
    const memory = await MemoryModel.findById(memoryID);

    // Find the user by their ID
    const user = await UserModel.findById(userID); // <--- CORRECTED: Find User by userID using UserModel

    // Check if both memory and user were found
    if (!memory) {
      return res.status(404).json({ message: "Memory not found." });
    }
    if (!user) {
       // This case might be less common if verifyToken ensures a valid user exists
       return res.status(404).json({ message: "User not found." });
    }

    // Add the memory's ID to the user's savedMemories array if it's not already there
    // Assuming savedMemories in UserModel is an array of memory _id strings
    if (!user.savedMemories.includes(memoryID)) {
         user.savedMemories.push(memory._id); // <--- CORRECTED: Push the memory's _id
         await user.save(); // Save the updated user document
    }


    // Respond with the updated list of saved memory IDs from the user document
    // This is what the frontend expects to update its state
    res.json({ savedMemories: user.savedMemories }); // <--- CORRECTED: Send back the user's savedMemories

  } catch (err) {
    console.error("Error saving memory on backend:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET IDs of saved memories for a specific user
router.get("/savedMemories/ids/:userID", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID);
    // Use optional chaining ?. just in case user is null or undefined, default to empty array
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
    // Find all memories where the _id is in the user's savedMemories array
    const savedMemories = await MemoryModel.find({
      _id: { $in: user.savedMemories },
    });
    res.json({ savedMemories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export { router as memoriesRouter };