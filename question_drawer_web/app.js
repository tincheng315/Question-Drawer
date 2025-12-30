// Question Drawer (offline)
// - One question per line
// - Press Enter in the command box to draw
// - Type 'finish' + Enter to stop
// - Avoid repeats until all are used, then reshuffle
// - Saves your question list in localStorage

let allQuestions = [];
let remaining = [];
let started = false;
let stopped = false;

const elQuestions = document.getElementById("questions");
const elStart = document.getElementById("startBtn");
const elDraw = document.getElementById("drawBtn");
const elClear = document.getElementById("clearBtn");
const elQuestionBox = document.getElementById("questionBox");
const elCommand = document.getElementById("command");
const elStatus = document.getElementById("status");

function setStatus(text) {
  elStatus.textContent = text;
}

function readQuestionsFromTextarea() {
  const raw = elQuestions.value || "";
  return raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

function saveQuestionsToStorage(lines) {
  try {
    localStorage.setItem("qd_questions", JSON.stringify(lines));
  } catch (_) {}
}

function loadQuestionsFromStorage() {
  try {
    const s = localStorage.getItem("qd_questions");
    if (!s) return null;
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr : null;
  } catch (_) {
    return null;
  }
}

function resetDeck() {
  allQuestions = readQuestionsFromTextarea();
  remaining = [...allQuestions];
  started = true;
  stopped = false;

  saveQuestionsToStorage(allQuestions);

  elDraw.disabled = allQuestions.length === 0;
  elCommand.disabled = allQuestions.length === 0;
  elCommand.value = "";
  elCommand.focus();

  if (allQuestions.length === 0) {
    elQuestionBox.textContent = "No questions found. Add questions (one per line) then click Start / Reset.";
    setStatus("No questions");
  } else {
    elQuestionBox.textContent = "Ready. Press Enter to draw your first question.";
    setStatus(`Ready: ${remaining.length} in deck`);
  }
}

function reshuffleIfNeeded() {
  if (remaining.length === 0 && allQuestions.length > 0) {
    remaining = [...allQuestions];
    setStatus(`Reshuffled: ${remaining.length} in deck`);
  }
}

function drawQuestion() {
  if (!started) {
    elQuestionBox.textContent = "Click Start / Reset first.";
    return;
  }
  if (stopped) {
    elQuestionBox.textContent = "Stopped. Type Start / Reset to begin again.";
    return;
  }
  if (allQuestions.length === 0) {
    elQuestionBox.textContent = "No questions found.";
    return;
  }

  reshuffleIfNeeded();

  const idx = Math.floor(Math.random() * remaining.length);
  const q = remaining[idx];
  remaining.splice(idx, 1);

  elQuestionBox.textContent = q;
  setStatus(`Remaining: ${remaining.length}`);
}

function stopProgram() {
  stopped = true;
  elDraw.disabled = true;
  elCommand.disabled = true;
  setStatus("Stopped");
  elQuestionBox.textContent = "Finished. (Type Start / Reset to restart.)";
}

function clearSaved() {
  try { localStorage.removeItem("qd_questions"); } catch (_) {}
  elQuestions.value = "";
  allQuestions = [];
  remaining = [];
  started = false;
  stopped = false;
  elDraw.disabled = true;
  elCommand.disabled = true;
  elCommand.value = "";
  elQuestionBox.textContent = "Cleared. Paste questions and click Start / Reset.";
  setStatus("Not started");
}

elStart.addEventListener("click", () => {
  resetDeck();
});

elDraw.addEventListener("click", () => {
  drawQuestion();
  elCommand.focus();
});

elClear.addEventListener("click", () => {
  clearSaved();
});

// Enter key behavior in the command box:
// - empty + Enter => draw
// - 'finish' + Enter => stop
elCommand.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const cmd = (elCommand.value || "").trim().toLowerCase();
  if (cmd === "finish") {
    stopProgram();
    return;
  }

  // any other text: treat as empty, just draw
  elCommand.value = "";
  drawQuestion();
});

// On load: populate textarea from storage if available
const saved = loadQuestionsFromStorage();
if (saved && saved.length) {
  elQuestions.value = saved.join("\n");
  elQuestionBox.textContent = "Loaded your saved questions. Click Start / Reset to begin.";
  setStatus("Loaded");
} else {
  elQuestions.value = [
    "list all the properties of indirect utility function",
    "list all the properties of expenditure function",
    "list all the properties of profit function",
    "list the duality between utility maximization and expenditure minimization",
    "list the duality between profit maximization and cost minimization",
    "list the Slutsky equation",
    "list the Roy's identity",
    "list the formulas for consumer surplus, compensated variation, equivalent variation",
    "list the formulas for substitution effect and income effect",
    "define pareto efficiency",
  ].join("\n");
  setStatus("Not started");
}
