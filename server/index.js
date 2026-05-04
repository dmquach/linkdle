import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getRandomWord, checkGuess } from "./gameLogic.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const games = {};

app.get("/", (req, res) => {
  res.send("Definitely not Wordle API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy" });
});

app.post("/api/games", (req, res) => {
  const id = Date.now().toString();
  const answer = getRandomWord();

  games[id] = {
    id,
    answer,
    guesses: [],
    status: "active",
    attemptsUsed: 0,
  };

  res.status(201).json({
    id,
    status: "active",
    attemptsUsed: 0,
    maxAttempts: 5,
  });
});

app.post("/api/games/:id/guess", (req, res) => {
  const { id } = req.params;
  const { guess } = req.body;

  const game = games[id];

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  if (game.status !== "active") {
    return res.status(400).json({ error: "Game is already finished" });
  }

  if (!guess || guess.length !== 5) {
    return res.status(400).json({ error: "Guess must be exactly 5 letters" });
  }

  const cleanGuess = guess.toUpperCase();
  const feedback = checkGuess(game.answer, cleanGuess);

  game.attemptsUsed++;

  game.guesses.push({
    guess: cleanGuess,
    feedback,
  });

  if (cleanGuess === game.answer) {
    game.status = "won";
  } else if (game.attemptsUsed >= 5) {
    game.status = "lost";
  }

  res.json({
    id: game.id,
    guess: cleanGuess,
    feedback,
    status: game.status,
    attemptsUsed: game.attemptsUsed,
    maxAttempts: 5,
  });
});

app.get("/api/games/:id", (req, res) => {
  const game = games[req.params.id];

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json({
    id: game.id,
    guesses: game.guesses,
    status: game.status,
    attemptsUsed: game.attemptsUsed,
    maxAttempts: 5,
  });
});

app.get("/api/games/:id/answer", (req, res) => {
  const game = games[req.params.id];

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json({
    answer: game.answer,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});