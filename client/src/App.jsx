import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

function App() {
  const [gameId, setGameId] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState("not_started");
  const [message, setMessage] = useState("Click New Game to start.");
  const [answer, setAnswer] = useState("");
  const [keyColors, setKeyColors] = useState({});

  const startGame = async () => {
    const res = await fetch(`${API_URL}/api/games`, { method: "POST" });
    const data = await res.json();

    setGameId(data.id);
    setGuesses([]);
    setCurrentGuess("");
    setStatus(data.status);
    setMessage("New game started!");
    setAnswer("");
    setKeyColors({});
  };

  const fetchAnswer = async () => {
    const res = await fetch(`${API_URL}/api/games/${gameId}/answer`);
    const data = await res.json();
    setAnswer(data.answer);
  };

  const updateKeyboardColors = (feedback) => {
    const priority = { gray: 1, yellow: 2, green: 3 };

    setKeyColors((prev) => {
      const updated = { ...prev };

      feedback.forEach((tile) => {
        const oldColor = updated[tile.letter];

        if (!oldColor || priority[tile.color] > priority[oldColor]) {
          updated[tile.letter] = tile.color;
        }
      });

      return updated;
    });
  };

  const submitGuess = async () => {
    if (!gameId || status !== "active") return;

    if (currentGuess.length !== 5) {
      setMessage("Not enough letters.");
      return;
    }

    const res = await fetch(`${API_URL}/api/games/${gameId}/guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guess: currentGuess }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }

    setGuesses((prev) => [...prev, data.feedback]);
    updateKeyboardColors(data.feedback);
    setCurrentGuess("");
    setStatus(data.status);

    if (data.status === "won") {
      setMessage("You won!");
    } else if (data.status === "lost") {
      setMessage("You lost!");
      fetchAnswer();
    } else {
      setMessage(`Attempt ${data.attemptsUsed}/5`);
    }
  };

  const addLetter = (letter) => {
    if (status !== "active") return;

    if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + letter);
    }
  };

  const deleteLetter = () => {
    if (status !== "active") return;

    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleKeyPress = (key) => {
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACK") {
      deleteLetter();
    } else {
      addLetter(key);
    }
  };

  useEffect(() => {
    const handlePhysicalKeyboard = (e) => {
      const key = e.key.toUpperCase();

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        deleteLetter();
      } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
      }
    };

    window.addEventListener("keydown", handlePhysicalKeyboard);

    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyboard);
    };
  }, [currentGuess, status, gameId]);

  const rows = [];

  for (let i = 0; i < 5; i++) {
    if (i < guesses.length) {
      rows.push(guesses[i]);
    } else if (i === guesses.length && status === "active") {
      rows.push(
        [0, 1, 2, 3, 4].map((index) => ({
          letter: currentGuess[index] || "",
          color: "empty",
        }))
      );
    } else {
      rows.push(
        [0, 1, 2, 3, 4].map(() => ({
          letter: "",
          color: "empty",
        }))
      );
    }
  }

  return (
    <div className="app">
      <h1>Definitely Not Wordle</h1>

      <button onClick={startGame}>New Game</button>

      <div className="board">
        {rows.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((tile, colIndex) => (
              <div className={`tile ${tile.color}`} key={colIndex}>
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p>{message}</p>

      {answer && <h2>Answer: {answer}</h2>}

      <div className="keyboard">
        {keyboardRows.map((row, rowIndex) => (
          <div className="keyboard-row" key={rowIndex}>
            {row.map((key) => (
              <button
                key={key}
                className={`key ${keyColors[key] || ""} ${
                  key === "ENTER" || key === "BACK" ? "wide-key" : ""
                }`}
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;