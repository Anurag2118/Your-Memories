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
    userOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
})

export const MemoryModel = mongoose.model("memories", MemorySchema);
