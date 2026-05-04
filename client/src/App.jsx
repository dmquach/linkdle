import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [gameId, setGameId] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState("not_started");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");

  const startGame = async () => {
    const res = await fetch(`${API_URL}/api/games`, {
      method: "POST",
    });

    const data = await res.json();

    setGameId(data.id);
    setGuesses([]);
    setCurrentGuess("");
    setStatus(data.status);
    setMessage("New game started!");
    setAnswer("");
  };

  const submitGuess = async (e) => {
    e.preventDefault();

    if (!gameId) {
      setMessage("Start a game first.");
      return;
    }

    if (currentGuess.length !== 5) {
      setMessage("Guess must be exactly 5 letters.");
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
    setCurrentGuess("");
    setStatus(data.status);

    if (data.status === "won") {
      setMessage("You won!");
    } else if (data.status === "lost") {
      setMessage("You lost! Reveal the answer.");
    } else {
      setMessage(`Attempt ${data.attemptsUsed}/5`);
    }
  };

  const revealAnswer = async () => {
    if (!gameId) {
      setMessage("Start a game first.");
      return;
    }

    const res = await fetch(`${API_URL}/api/games/${gameId}/answer`);
    const data = await res.json();

    setAnswer(data.answer);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();

    if (/^[A-Z]*$/.test(value) && value.length <= 5) {
      setCurrentGuess(value);
    }
  };

  const emptyRows = 5 - guesses.length;

  return (
    <div className="app">
      <h1>Linkdle</h1>

      <button onClick={startGame}>New Game</button>

      <div className="board">
        {guesses.map((guess, rowIndex) => (
          <div className="row" key={rowIndex}>
            {guess.map((tile, colIndex) => (
              <div className={`tile ${tile.color}`} key={colIndex}>
                {tile.letter}
              </div>
            ))}
          </div>
        ))}

        {status === "active" && (
          <div className="row">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="tile empty" key={i}>
                {currentGuess[i] || ""}
              </div>
            ))}
          </div>
        )}

        {Array.from({ length: status === "active" ? emptyRows - 1 : emptyRows }).map(
          (_, rowIndex) => (
            <div className="row" key={`empty-${rowIndex}`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="tile empty" key={i}></div>
              ))}
            </div>
          )
        )}
      </div>

      <form onSubmit={submitGuess}>
        <input
          value={currentGuess}
          onChange={handleInputChange}
          placeholder="Enter 5 letters"
          disabled={status !== "active"}
        />

        <button type="submit" disabled={status !== "active"}>
          Guess
        </button>
      </form>

      <button onClick={revealAnswer}>Reveal Answer</button>

      <p>{message}</p>

      {answer && <h2>Answer: {answer}</h2>}
    </div>
  );
}

export default App;