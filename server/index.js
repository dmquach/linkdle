import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getRandomWord, checkGuess, isValidWord } from "./gameLogic.js";
import { pool } from "./db.js";
import jwt from "jsonwebtoken";
import fs from "fs";

import cookieParser from "cookie-parser";
import {
  registerUser,
  loginUser,
  logoutUser,
  requireAuth,
  getCurrentUser,
  demoLogin,
} from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://linkdle-7mml.onrender.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
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

  const token = req.cookies?.token;
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      userId = null;
    }
  }

  games[id] = {
    id,
    answer,
    guesses: [],
    status: "active",
    attemptsUsed: 0,
    userId,
  };

  res.status(201).json({
    id,
    status: "active",
    attemptsUsed: 0,
    maxAttempts: 6,
  });
});

app.post("/api/games/:id/guess", async (req, res) => {
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
  const valid = await isValidWord(cleanGuess);

  if (!valid) {
    return res.status(400).json({ error: "Not a valid word OR valid word API not working. Submit guess again or change word." });
  }

  const feedback = checkGuess(game.answer, cleanGuess);

  game.attemptsUsed++;

  game.guesses.push({
    guess: cleanGuess,
    feedback,
  });

  if (cleanGuess === game.answer) {
    game.status = "won";
  } else if (game.attemptsUsed >= 6) {
    game.status = "lost";
  }

    if (game.status === "won" || game.status === "lost") {
    const userId = game.userId;

    if (userId) {
        await pool.query(
        `
        INSERT INTO game_results 
        (user_id, game_id, status, attempts_used, answer)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [userId, game.id, game.status, game.attemptsUsed, game.answer]
        );
    }
    }

  res.json({
    id: game.id,
    guess: cleanGuess,
    feedback,
    status: game.status,
    attemptsUsed: game.attemptsUsed,
    maxAttempts: 6,
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
    maxAttempts: 6,
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


// users
app.post("/api/auth/register", registerUser);
app.post("/api/auth/login", loginUser);
app.post("/api/auth/logout", logoutUser);
app.get("/api/auth/me", requireAuth, getCurrentUser);
app.post("/api/auth/demo", demoLogin);

// stats
app.get("/api/users/me/stats", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    `
    SELECT 
      COUNT(*)::int AS played,
      COUNT(*) FILTER (WHERE status = 'won')::int AS wins,
      COUNT(*) FILTER (WHERE status = 'lost')::int AS losses,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 1)::int AS win_1,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 2)::int AS win_2,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 3)::int AS win_3,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 4)::int AS win_4,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 5)::int AS win_5,
      COUNT(*) FILTER (WHERE status = 'won' AND attempts_used = 6)::int AS win_6
    FROM game_results
    WHERE user_id = $1
    `,
    [userId]
  );

  const stats = result.rows[0];

  const wins = stats.wins || 0;

  const guessDistribution = [1, 2, 3, 4, 5, 6].map((attempt) => {
    const count = stats[`win_${attempt}`] || 0;

    return {
      attempts: attempt,
      count,
      percentage: wins === 0 ? 0 : Math.round((count / wins) * 100),
    };
  });

  res.json({
    played: stats.played,
    wins: stats.wins,
    losses: stats.losses,
    winPercentage:
      stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100),
    guessDistribution,
  });
});
