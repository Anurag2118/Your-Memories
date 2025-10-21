import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/users.js";
import { memoriesRouter } from "./routes/memories.js";

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

app.use("/auth", userRouter);

app.use("/memories", memoriesRouter);

mongoose.connect(process.env.REACT_APP_MONGODB_URI);

app.listen(port,()=>{
    console.log("SERVER STARTED");
});