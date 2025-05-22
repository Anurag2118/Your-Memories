import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/users.js";
import { memoriesRouter } from "./routes/memories.js";
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", userRouter);

app.use("/memories", memoriesRouter);

mongoose.connect(process.env.REACT_APP_MONGODB_URI);

app.listen(3001,()=>{
    console.log("SERVER STARTED");
});