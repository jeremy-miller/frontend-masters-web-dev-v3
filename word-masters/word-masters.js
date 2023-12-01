"use strict";

const infoBar = document.querySelector(".info-bar");
const letters = document.querySelectorAll(".letter");
const GUESS_LENGTH = 5;
const ROUNDS = 6;
let secretWord;
let secretWordParts;
let isLoading = true;
let currentGuess = "";
let currentRow = 0;
let done = false;

function toggleLoading() {
  isLoading = !isLoading;
  infoBar.classList.toggle("show", isLoading);
}

async function getSecretWord() {
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  // const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
  const resJson = await res.json();
  secretWord = resJson.word.toUpperCase();
  secretWordParts = secretWord.split("");
  toggleLoading();
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function addLetter(letter) {
  if (currentGuess.length < GUESS_LENGTH) {
    currentGuess += letter;
  } else {
    // replace the last letter of the row/guess
    currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
  }

  letters[currentRow * GUESS_LENGTH + currentGuess.length - 1].innerText =
    letter;
}

function backspace() {
  // remove that last letter
  currentGuess = currentGuess.substring(0, currentGuess.length - 1);
  letters[currentRow * GUESS_LENGTH + currentGuess.length].innerText = "";
}

async function isValidWord() {
  toggleLoading();
  const res = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: currentGuess }),
  });
  const resJson = await res.json();
  const validWord = resJson.validWord;
  toggleLoading();
  return validWord;
}

function markInvalidWord() {
  for (let i = 0; i < GUESS_LENGTH; i++) {
    letters[currentRow * GUESS_LENGTH + i].classList.remove("invalid");
    // wait long enough for browser to repaint without "invalid" class, so we can add it again
    setTimeout(
      () => letters[currentRow * GUESS_LENGTH + i].classList.add("invalid"),
      10 // ms
    );
  }
}

async function submit() {
  if (currentGuess.length !== GUESS_LENGTH) {
    return;
  }

  const validWord = await isValidWord();
  if (!validWord) {
    markInvalidWord();
    return;
  }

  const secretWordMap = buildLetterMap(secretWordParts);
  const guessParts = currentGuess.split("");

  // mark correct
  for (let i = 0; i < GUESS_LENGTH; i++) {
    if (guessParts[i] === secretWordParts[i]) {
      letters[currentRow * GUESS_LENGTH + i].classList.add("correct");
      secretWordMap[guessParts[i]]--;
    }
  }

  if (currentGuess === secretWord) {
    done = true;
    alert("You win!");
    document.querySelector(".brand").classList.add("win");
    return;
  }

  // mark close or wrong
  for (let i = 0; i < GUESS_LENGTH; i++) {
    if (
      guessParts[i] !== secretWordParts[i] &&
      secretWordMap[guessParts[i]] > 0 &&
      secretWordParts.includes(guessParts[i])
    ) {
      letters[currentRow * GUESS_LENGTH + i].classList.add("close");
      secretWordMap[guessParts[i]]--;
    } else {
      letters[currentRow * GUESS_LENGTH + i].classList.add("wrong");
    }
  }

  currentRow++;
  currentGuess = "";
  if (currentRow === ROUNDS) {
    alert(`You lose, the word was ${secretWord}`);
    done = true;
  }
}

function keydownListener(key) {
  if (done || isLoading) {
    return;
  }

  if (key === "Enter") {
    submit();
  } else if (key === "Backspace") {
    backspace();
  } else if (isLetter(key)) {
    addLetter(key.toUpperCase());
  }
}

async function init() {
  document.addEventListener("keydown", (event) => keydownListener(event.key));
  await getSecretWord();
  console.log(`secretWord = ${secretWord}`);
}

function buildLetterMap(letterArray) {
  const letterArrayMap = {};
  for (let i = 0; i < letterArray.length; i++) {
    const letter = letterArray[i];
    if (letterArrayMap[letter]) {
      letterArrayMap[letter]++;
    } else {
      letterArrayMap[letter] = 1;
    }
  }
  return letterArrayMap;
}

init();
