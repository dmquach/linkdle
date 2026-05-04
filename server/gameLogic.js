const WORDS = ["APPLE", "GRAPE", "PLANT", "BRICK", "CHAIR"];

export function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function checkGuess(answer, guess) {
  answer = answer.toUpperCase();
  guess = guess.toUpperCase();

  const feedback = [];
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");

  const used = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      feedback[i] = {
        letter: guessLetters[i],
        color: "green",
      };
      used[i] = true;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (feedback[i]) continue;

    let found = false;

    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessLetters[i] === answerLetters[j]) {
        found = true;
        used[j] = true;
        break;
      }
    }

    feedback[i] = {
      letter: guessLetters[i],
      color: found ? "yellow" : "gray",
    };
  }

  return feedback;
}