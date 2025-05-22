import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    savedMemories: [{type: mongoose.Schema.Types.ObjectId, ref: "memories"}],
})

export const UserModel = mongoose.model("users", UserSchema);

