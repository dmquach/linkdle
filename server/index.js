import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Definitely not Wordle API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});