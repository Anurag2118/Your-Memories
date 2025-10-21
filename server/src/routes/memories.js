import express from "express";
import { UserModel } from "../models/Users.js";
import { MemoryModel } from "../models/memories.js";
import { verifyToken } from "./users.js";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all memories
router.get("/", async (req, res) => {
  try {
    const response = await MemoryModel.find({});
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new memory (requires token AND file upload)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  
  const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "memories" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  };

  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageURL = uploadResult.secure_url;

    const descriptions = JSON.parse(req.body.descriptions);

    const memory = new MemoryModel({
      name: req.body.name,
      descriptions: descriptions,
      imageURL: imageURL,
      timeSpent: req.body.timeSpent,
      userOwner: req.userID,
    });

    const response = await memory.save();
    res.status(201).json(response);
  } catch (err) {
    console.error("Error creating memory with upload:", err);
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
      await UserModel.updateOne({ _id: userID }, { $pull: { savedMemories: memoryID } });
    } else {
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