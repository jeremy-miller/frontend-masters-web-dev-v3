"use strict";

const screen = document.querySelector(".screen");
let buffer = "0";
let runningTotal = 0;
let previousOperator = null;

function updateScreen() {
  screen.innerText = buffer;
}

function updateRunningTotal(intBuffer) {
  switch (previousOperator) {
    case "÷":
      runningTotal /= intBuffer;
      break;
    case "×":
      runningTotal *= intBuffer;
      break;
    case "-":
      runningTotal -= intBuffer;
      break;
    case "+":
      runningTotal += intBuffer;
      break;
  }
}

function handleMathSymbol(mathSymbol) {
  const intBuffer = parseInt(buffer);
  if (runningTotal === 0) {
    runningTotal = intBuffer;
  } else {
    updateRunningTotal(intBuffer);
  }
  previousOperator = mathSymbol;
  buffer = "0";
}

function handleSymbol(symbol) {
  switch (symbol) {
    case "C":
      buffer = "0";
      runningTotal = 0;
      previousOperator = null;
      break;
    case "←":
      if (buffer.length === 1) {
        buffer = "0";
      } else {
        buffer = buffer.substring(0, buffer.length - 1);
      }
      break;
    case "÷":
    case "×":
    case "-":
    case "+":
      handleMathSymbol(symbol);
      break;
    case "=":
      if (previousOperator !== null) {
        const intBuffer = parseInt(buffer);
        updateRunningTotal(intBuffer);
      }
      buffer = runningTotal.toString();
      runningTotal = 0;
      previousOperator = null;
      break;
  }
}

function handleNumber(number) {
  if (buffer === "0") {
    buffer = number;
  } else {
    buffer += number;
  }
}

function buttonClick(buttonText) {
  if (isNaN(parseInt(buttonText))) {
    handleSymbol(buttonText);
  } else {
    handleNumber(buttonText);
  }
  updateScreen();
}

function addButtonEventListener() {
  document
    .querySelector(".buttons")
    .addEventListener("click", (event) => buttonClick(event.target.innerText));
}

function init() {
  addButtonEventListener();
}

init();
