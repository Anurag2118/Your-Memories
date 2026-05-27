import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema({
    name:{
       type: String,
       required: true,
    },
    descriptions:[{
        type: String,
        required: true
    }],
    imageURL: {
        type: String, 
        required: true
    },
    timeSpent: {
        type: String, 
        required: true
    },
    budget: {
        type: Number, 
        required: true,
        default: 0
    },
    category: {
        type: String, 
        required: true,
        default: "General"
    },
    userOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
})

export const MemoryModel = mongoose.model("memories", MemorySchema);
