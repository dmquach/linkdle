import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [keyColors, setKeyColors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [revealingRow, setRevealingRow] = useState(null);

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    losses: 0,
    winPercentage: 0,
    guessDistribution: [],
  });

  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  const apiFetch = (path, options = {}) => {
    return fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  };

  const startGame = async () => {
    try {
      const res = await apiFetch("/api/games", { method: "POST" });
      const data = await res.json();

      setGameId(data.id);
      setGuesses([]);
      setCurrentGuess("");
      setStatus(data.status);
      setMessage("");
      setAnswer("");
      setKeyColors({});
      setShowGameOverModal(false);
      setShowAuthModal(false);
    } catch {
      setMessage("Backend server is not running. Try refreshing.");
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const res = await apiFetch("/api/users/me/stats");

    if (!res.ok) return;

    const data = await res.json();
    setStats(data);
  };

  const fetchAnswer = async () => {
    const res = await apiFetch(`/api/games/${gameId}/answer`);
    const data = await res.json();
    setAnswer(data.answer);
  };

  const checkCurrentUser = async () => {
    try {
      const res = await apiFetch("/api/auth/me");

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      authMode === "login" ? "/api/auth/login" : "/api/auth/register";

    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAuthMessage(data.error || "Authentication failed.");
      return;
    }

    setUser(data.user);
    setEmail("");
    setPassword("");
    setAuthMessage("");
    setShowAuthModal(false);
    setShowGameOverModal(false);
  };

  const handleDemoLogin = async () => {
    const res = await apiFetch("/api/auth/demo", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setAuthMessage(data.error || "Demo login failed.");
      return;
    }

    setUser(data.user);
    setAuthMessage("");
    setShowAuthModal(false);
    setShowGameOverModal(false);
  };

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    setStats({
      played: 0,
      wins: 0,
      losses: 0,
      winPercentage: 0,
      guessDistribution: [],
    });
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
    if (!gameId || status !== "active" || isSubmitting) return;

    if (currentGuess.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setMessage("Not enough letters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/api/games/${gameId}/guess`, {
        method: "POST",
        body: JSON.stringify({ guess: currentGuess }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");

        if (data.error === "Not a valid word OR valid word API not working. Submit guess again or change word.") {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }

        return;
      }

      const submittedRowIndex = guesses.length;

      setGuesses((prev) => [...prev, data.feedback]);
      setCurrentGuess("");
      setRevealingRow(submittedRowIndex);

      setTimeout(() => {
        updateKeyboardColors(data.feedback);
        setStatus(data.status);
        setRevealingRow(null);

      if (data.status === "won") {
        setTimeout(() => {
          fetchStats();
        }, 300);
        setMessage("You won!");
        setShowGameOverModal(true);
      } else if (data.status === "lost") {
        setTimeout(() => {
          fetchStats();
        }, 300);
        setMessage("You lost!");
        fetchAnswer();
        setShowGameOverModal(true);
      } else {
        setMessage(`Attempt ${data.attemptsUsed}/6`);
      }

      }, 1600);
    } finally {
      setIsSubmitting(false);
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
      const tag = e.target.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      e.preventDefault();

      if (e.repeat) return;

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
  }, [currentGuess, status, gameId, isSubmitting]);

  useEffect(() => {
    checkCurrentUser();
    startGame();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const rows = [];

  for (let i = 0; i < 6; i++) {
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
      <div className="top-bar">
        <button onClick={() => setShowHowToPlay(true)}>How to Play</button>

        <div>
          {user ? (
            <>
              <span className="user-label">{user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowAuthModal(true)}>Login</button>
              <button className="demo-button" onClick={handleDemoLogin}>
                Demo Login
              </button>
            </>
          )}
        </div>
      </div>

      <div className="title">
        <h1>Linkdle</h1>
        <img src="/GoLinks.png" alt="GoLinks Logo" className="logo" />
      </div>

      {showHowToPlay && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="close-button" onClick={() => setShowHowToPlay(false)}>
              ×
            </button>

            <h2>How to Play</h2>
            <p>Guess the secret 5-letter word in 6 tries.</p>
            <p><strong>Green</strong>: correct letter and position.</p>
            <p><strong>Yellow</strong>: letter is in the word, wrong position.</p>
            <p><strong>Gray</strong>: letter is not in the word.</p>

            <button onClick={() => setShowHowToPlay(false)}>Start Playing</button>
            {!user && (
              <div className="modal-login-actions">
                <p>Login to save your stats next game.</p>

                <button
                  onClick={() => {
                    setShowHowToPlay(false);
                    setShowAuthModal(true);
                  }}
                >
                  Login
                </button>

                <button
                  className="demo-button"
                  onClick={() => {
                    setShowHowToPlay(false);
                    handleDemoLogin();
                  }}
                >
                  Demo Login
                </button>
              </div>
            )}
          </div>

        </div>

      )}

      {showAuthModal && !user && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="close-button" onClick={() => setShowAuthModal(false)}>
              ×
            </button>

            <h2>{authMode === "login" ? "Login" : "Register"}</h2>

            <form onSubmit={handleAuthSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit">
                {authMode === "login" ? "Login" : "Register"}
              </button>

              <button type="button" className="demo-button" onClick={handleDemoLogin}>
                Demo Login
              </button>

              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                Switch to {authMode === "login" ? "Register" : "Login"}
              </button>

              {authMessage && <p>{authMessage}</p>}
            </form>
          </div>
        </div>
      )}

      {showGameOverModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="close-button"
              onClick={() => {
                  setShowGameOverModal(false);
                  {!user && (
                    <button onClick={() => setShowAuthModal(true)}>Login</button>
                  )}
                }
              }
            >
              ×
            </button>

            <h2>{message}</h2>

            {answer && <h3>Answer: {answer}</h3>}

            {user ? (
              <div className="stats-box">
                <h3>Your Stats (Sometimes request fails and game data is lost)</h3>

                <p>Played: {stats.played}</p>
                <p>Wins: {stats.wins}</p>
                <p>Losses: {stats.losses}</p>
                <p>Win Rate: {stats.winPercentage}%</p>

                <h4>Guess Distribution</h4>

                <div className="guess-distribution">
                  {stats.guessDistribution.map((item) => (
                    <div className="guess-row" key={item.attempts}>
                      <span className="guess-label">{item.attempts}</span>

                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        >
                          {item.count > 0 && (
                            <span>
                              {item.count} ({item.percentage}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Login to save your stats.</p>
            )}

            {!user && (
              <>
                <button onClick={() => {
                  setShowAuthModal(true)
                  setShowGameOverModal(false);
                }}>Login</button>
                <button className="demo-button" onClick={handleDemoLogin}>
                  Demo Login
                </button>
              </>
            )}

            <button onClick={startGame}>New Game</button>
          </div>
        </div>
      )}

      <div className="board">
        {rows.map((row, rowIndex) => (
          <div
            className={`row ${
              shake && rowIndex === guesses.length ? "shake" : ""
            }`}
            key={rowIndex}
          >
            {row.map((tile, colIndex) => (
              <div
                className={`tile ${tile.color} ${
                  revealingRow === rowIndex ? "flip" : ""
                }`}
                style={{
                  animationDelay:
                    revealingRow === rowIndex ? `${colIndex * 0.25}s` : "0s",
                }}
                key={colIndex}
              >
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p>{message}</p>

      {(status === "won" || status === "lost") && (
        <button onClick={startGame}>New Game</button>
      )}

      <div className="keyboard">
        {keyboardRows.map((row, rowIndex) => (
          <div className="keyboard-row" key={rowIndex}>
            {row.map((key) => (
              <button
                key={key}
                disabled={isSubmitting || status !== "active"}
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