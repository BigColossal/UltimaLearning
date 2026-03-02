import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { importCurriculum } from "./importCurriculum.js";

dotenv.config();

// read json file
const curriculum = JSON.parse(
  fs.readFileSync(new URL("./jsCurriculum.json", import.meta.url)),
);

await mongoose.connect(process.env.MONGODB_URI);

await importCurriculum(curriculum, process.env.USER_ID);

console.log("HTML curriculum imported");

process.exit();
