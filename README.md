# 🎯 Linkdle

A fullstack “Definitely Not Wordle” clone built with React, Node.js, and PostgreSQL.
Guess the hidden 5-letter word in 6 tries with real-time feedback, persistent user stats, and authentication.

🌐 **Live Site:** *(add your frontend URL here once deployed)*
🔗 **Backend API:** [https://linkdle-api.onrender.com](https://linkdle-api.onrender.com)

---

## 🚀 Features

### 🎮 Core Gameplay

* 5-letter word guessing game
* 6 attempts per game
* Tile feedback:

  * 🟩 Green: correct letter, correct position
  * 🟨 Yellow: correct letter, wrong position
  * ⬜ Gray: letter not in word
* Virtual keyboard + physical keyboard support
* Tile flip animations and row shake feedback
* Input validation for guesses
* Login has to be done before game starts to track data

---
## Word List Notes

The backend uses a curated 5-letter answer list plus a larger valid-guess list.  
Some words are intentionally excluded, including many plural 4-letter words ending in `s`, because they make the game less interesting as answer choices.
---

### 🔐 Authentication

* User registration and login
* Secure password hashing (bcrypt)
* JWT-based authentication (HTTP-only cookies)
* Persistent login sessions
* **Demo Login** for quick access

---

### 📊 Player Statistics (Persistent)

* Stats stored per user in PostgreSQL
* Tracks:

  * Total games played
  * Wins / losses
  * Win percentage
* **Guess distribution:**

  * Wins by number of guesses (1–6)
  * Percentage per guess count
* Animated bar graph visualization

---

### 🧠 UX / UI Polish

* Modal-based UI system:

  * 📘 “How to Play” popup (on first load)
  * 🔐 Login/Register modal
  * 🏆 Game-over modal with stats
* Demo login highlighted for usability
* Board remains visible after game ends
* Smooth animations:

  * Tile flip reveal
  * Invalid word shake
  * Animated stat bars

---

### 🧩 Backend Features

* REST API built with Express
* Game state stored server-side (prevents cheating)
* Word validation:

  * Local word list fallback
  * External dictionary API integration:

    ```
    https://api.dictionaryapi.dev/api/v2/entries/en/<word>
    ```
* Secure cookie handling for production

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* CSS (custom styling + animations)

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL (Render hosted)

### Deployment

* Render:

  * Web Service (API)
  * Static Site / Web App (Frontend)
  * PostgreSQL Database

---

## 🧪 Running Locally

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Run backend

```bash
cd server
npm run dev
```

### 3. Run frontend

```bash
cd client
npm run dev
```

---

## 📦 Deployment (Render)

* Backend → Web Service (`server/`)
* Frontend → Static Site (`client/`)
* Database → Render PostgreSQL

---

## 🛠️ Future Improvements
* Break down into more modules
* Daily word system (global challenge)
* Leaderboards
* Share results (Wordle-style emoji grid)
* Dark/light theme toggle
* Mobile UI polish
* Rate limiting & API caching
* Add more player statistics (Avg score)
* Add previous game history
* Add hard more