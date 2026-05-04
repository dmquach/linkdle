const WORDS = [
  "APPLE","GRAPE","PLANT","BRICK","CHAIR","CRANE","SLATE","LIGHT","STONE","BRAIN",
  "HOUSE","TRAIN","FLAME","PRIDE","CLOUD","RIVER","SOUND","WORLD","MONEY","TABLE",
  "SHINE","BLEND","CLEAN","DRIVE","FRAME","GHOST","HEART","INDEX","JUDGE","KNIFE",
  "LUNCH","MARCH","NIGHT","OCEAN","PEACE","QUICK","ROUTE","SWEET","THINK","UNION",
  "VOICE","WATER","YOUTH","ZEBRA","ANGEL","BREAD","CANDY","DANCE","EARTH","FAITH",
  "GLASS","HUMAN","IDEAL","JUICE","KNACK","LAYER","METAL","NURSE","OPERA","PANEL",
  "QUEEN","RANGE","SCALE","TEACH","URBAN","VITAL","WHEEL","YEARN","ZONED","ALIVE",
  "BEACH","CARRY","DELAY","ENJOY","FORCE","GRAND","HAPPY","INPUT","JOLLY","KNOCK",
  "LEVEL","MAJOR","NOVEL","ORDER","POWER","QUIET","RAPID","SMART","TRUST","UPPER",
  "VALUE","WORTH","XENON","YIELD","ZESTY","ADORE","BLISS","CHARM","DREAM","EAGER",
  "FANCY","GIANT","HONEY","INNER","JEWEL","KARMA","LUCKY","MAGIC","NOBLE","OFFER",
  "PRIME","QUEST","ROYAL","SILKY","TREND","UNITY","VISIT","WITTY","XERIC","YUMMY",
  "ZAPPY","ACTOR","AGILE","ALERT","BASIC","BLADE","BOOST","BOUND","CIVIL","COVER",
  "DEPTH","DOUBT","ELITE","ENTRY","FAINT","FOCUS","GRADE","GRANT","HUMOR","IMAGE",
  "ISSUE","LABEL","LOCAL","MODEL","MOTOR","NERVE","OUGHT","POINT","PRESS","PRICE",
  "PROVE","RADAR","REACT","READY","RIDER","RIVAL","ROUND","SCORE","SHARP","SIGHT",
  "SKILL","SMILE","SOLID","SPEAK","SPEND","STAFF","STAGE","START","STATE","STORY",
  "STYLE","SUGAR","SUPER","TASTE","THEME","THING","TOUCH","TRACK","TRADE","TRIAL",
  "TRICK","TRUCK","TRULY","USAGE","VALID","VIDEO","VOTER","WASTE","WATCH","WHOLE",
  "WOMAN","WOMEN","WRITE","WRONG","YOUNG","ABOVE","ABOUT","ACUTE","ADMIT","ADOPT",
  "ADULT","AFTER","AGENT","AGREE","AHEAD","ALARM","ALBUM","ALONG","ALTER","AMONG",
  "ANGLE","APART","APPLY","ARENA","ARGUE","ARISE","ARRAY","ASIDE","ASSET","AUDIO",
  "AVOID","AWARD","AWARE","BADLY","BAKER","BASIS","BEGAN","BEGIN","BEGUN","BEING",
  "BELOW","BLACK","BLOCK","BLOOD","BOARD","BRAIN","BRAND","BREAD","BREAK","BRIEF",
  "BRING","BROAD","BROKE","BUILD","BUILT","BUYER","CABLE","CARRY","CATCH","CAUSE",
  "CHAIN","CHAIR","CHART","CHECK","CHEST","CHIEF","CHILD","CHOSE","CIVIL","CLAIM",
  "CLASS","CLEAN","CLEAR","CLICK","CLOCK","CLOSE","COACH","COAST","COULD","COUNT",
  "COURT","COVER","CREAM","CRIME","CROSS","CROWD","CROWN","CYCLE","DAILY","DANCE",
  "DATED","DEALT","DEATH","DEBUT","DELAY","DEPTH","DOING","DOUBT","DOZEN","DRAFT",
  "DRAMA","DRAWN","DREAM","DRESS","DRILL","DRINK","DRIVE","DROVE","DYING","EAGER",
  "EARLY","EARTH","EIGHT","ELDER","ELECT","ELITE","EMPTY","ENEMY","ENJOY","ENTER",
  "ENTRY","EQUAL","ERROR","EVENT","EVERY","EXACT","EXIST","EXTRA","FAITH","FALSE",
  "FAULT","FIBER","FIELD","FIFTH","FIFTY","FIGHT","FINAL","FIRST","FIXED","FLASH",
  "FLEET","FLOOR","FOCUS","FORCE","FORTH","FORTY","FOUND","FRAME","FRANK","FRAUD",
  "FRESH","FRONT","FRUIT","FULLY","FUNNY","GIANT","GIVEN","GLASS","GLOBE","GOING",
  "GRACE","GRADE","GRAND","GRANT","GRASS","GREAT","GREEN","GROSS","GROUP","GROWN"
];

export function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export async function isValidWord(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    return res.ok;
  } catch (error) {
    console.error("Dictionary API error:", error);
    return false;
  }
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