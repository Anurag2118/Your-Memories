import express from "express";
import { UserModel } from "../models/Users.js";
import { MemoryModel } from "../models/memories.js";
import { verifyToken } from "./users.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1" 
});

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all memories
router.get("/", async (req, res) => {
  try {
    const response = await MemoryModel.find({}).populate("userOwner", "username");
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new memory with image upload
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
      budget: req.body.budget,
      category: req.body.category,
      userOwner: req.userID,
    });

    const response = await memory.save();
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const memory = await MemoryModel.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    
    if (memory.userOwner.toString() !== req.userID) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    
    if (memory.imageURL) {
      const urlParts = memory.imageURL.split("/");
      const fileName = urlParts.pop();
      const folderName = urlParts.pop();
      const publicId = `${folderName}/${fileName.split(".")[0]}`;
      
      await cloudinary.uploader.destroy(publicId);
    }
    
    await MemoryModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/edit/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const memory = await MemoryModel.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    
    if (memory.userOwner.toString() !== req.userID) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    let updatedData = {
      name: req.body.name || memory.name,
      timeSpent: req.body.timeSpent || memory.timeSpent,
      budget: req.body.budget || memory.budget,
      category: req.body.category || memory.category,
    };

    if (req.body.descriptions) {
      updatedData.descriptions = JSON.parse(req.body.descriptions);
    }

    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "memories" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
      };
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updatedData.imageURL = uploadResult.secure_url;
    }

    const updatedMemory = await MemoryModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedMemory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    res.status(500).json({ message: err.message });
  }
});

router.get("/savedMemories/ids/:userID", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID);
    res.json({ savedMemories: user?.savedMemories || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userID);
    if (!user || user.savedMemories.length === 0) {
      return res.json([]);
    }

    const allPublicMemories = await MemoryModel.find({
      _id: { $nin: user.savedMemories },
      userOwner: { $ne: req.userID }
    });

    if (allPublicMemories.length === 0) {
      return res.json([]);
    }

    const savedMemories = await MemoryModel.find({ _id: { $in: user.savedMemories } });
    const userPreferences = savedMemories.map(m => `Category: ${m.category}, Budget: ${m.budget}`).join(" | ");

    const availableOptions = allPublicMemories.map(m => ({
      id: m._id.toString(),
      name: m.name,
      category: m.category,
      budget: m.budget
    }));

    const prompt = `User preferences: ${userPreferences}. Available pool: ${JSON.stringify(availableOptions)}. Pick up to 3 most relevant item IDs from the pool based on matching attributes. You must output ONLY a valid JSON object containing an array of strings under the key "recommendedIds". Example: {"recommendedIds": ["id1", "id2"]}`;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });
    
    const text = response.choices[0].message.content;
    const recommendedIds = JSON.parse(text).recommendedIds;

    if (!recommendedIds || recommendedIds.length === 0) {
      return res.json([]);
    }

    const recommendedMemories = await MemoryModel.find({ _id: { $in: recommendedIds } }).populate("userOwner", "username");
    res.json(recommendedMemories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export { router as memoriesRouter };