// Combine subject files
const questions = [
  { category: "Programming", questions: programmingQuestions || [] },
  { category: "Geography", questions: geographyQuestions || [] },
  { category: "Mathematics", questions: mathematicsQuestions || [] },
  { category: "Entertainment", questions: entertainmentQuestions || [] }
];

// Load extra questions from localStorage
const savedData = JSON.parse(localStorage.getItem("quizData")) || {};
for (let subject in savedData) {
  let subjectObj = questions.find(q => q.category.toLowerCase() === subject.toLowerCase());
  if (subjectObj && Array.isArray(savedData[subject])) {
    subjectObj.questions.push(...savedData[subject]);
  }
}

// DOM elements
const subjectSelect = document.getElementById("subject");
const quizContainer = document.getElementById("quiz-container");
const resultDiv = document.getElementById("result");
const controls = document.getElementById("controls");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const scoreBox = document.getElementById("score-box");
const configPopup = document.getElementById("config-popup");
const quizPopup = document.getElementById("quiz-popup");
const resultPopup = document.getElementById("result-popup");
const tryAgainBtn = document.getElementById("try-again-btn");
const timerBar = document.getElementById("timer-bar");

let currentQuestions = [];
let currentIndex = 0;
let answers = {};
let score = 0;
const QUIZ_TIME_LIMIT = 30; // seconds
let timerInterval;

// Fill dropdown
questions.forEach(sub => {
  let opt = document.createElement("option");
  opt.value = sub.category;
  opt.textContent = sub.category;
  subjectSelect.appendChild(opt);
});

// Start Quiz
document.getElementById("start-btn").addEventListener("click", () => {
  const selected = subjectSelect.value;
  if (!selected) return alert("Select a subject!");
  configPopup.classList.remove("active");
  quizPopup.classList.add("active");

  const subject = questions.find(q => q.category === selected);
  currentQuestions = subject.questions;
  currentIndex = 0;
  answers = {};
  score = 0;
  renderQuestion(currentIndex);
});

// Update score
function updateScore() {
  scoreBox.textContent = `Score: ${score} / ${currentQuestions.length}`;
}

// Render question
function renderQuestion(index) {
  clearInterval(timerInterval);
  quizContainer.innerHTML = "";
  const q = currentQuestions[index];

  const div = document.createElement("div");
  div.classList.add("question-block");

  div.innerHTML = `
    <p><strong>Q${index + 1}:</strong> ${q.question}</p>
    ${q.options.map((opt, i) => `
      <label class="option">
        <input type="radio" name="q${index}" value="${i}" ${answers[index] === i ? "checked" : ""}>
        ${opt}
        <span class="material-symbols-rounded feedback-icon"></span>
      </label><br>
    `).join("")}
  `;

  quizContainer.appendChild(div);

  // Buttons
  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === currentQuestions.length - 1 ? "none" : "inline-block";
  submitBtn.style.display = index === currentQuestions.length - 1 ? "inline-block" : "none";

  // Timer
  let timeLeft = QUIZ_TIME_LIMIT;
  timerBar.style.width = "100%";
  timerBar.style.background = "linear-gradient(90deg, #667eea, #764ba2)";
  timerInterval = setInterval(() => {
    timeLeft--;
    const perc = (timeLeft / QUIZ_TIME_LIMIT) * 100;
    timerBar.style.width = perc + "%";
    if (timeLeft <= 10) timerBar.style.background = "linear-gradient(90deg, #f6d365, #fda085)";
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      disableOptions();
    }
  }, 1000);

  // Immediate feedback
  const radios = quizContainer.querySelectorAll(`input[name="q${index}"]`);
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      const selectedValue = parseInt(radio.value);
      answers[index] = selectedValue;
      disableOptions();

      // Update score
      score = Object.keys(answers).reduce((acc, key) => {
        return acc + (answers[key] === currentQuestions[key].answer ? 1 : 0);
      }, 0);
      updateScore();
    });
  });
}

// Disable all options & show correct/wrong
function disableOptions() {
  const q = currentQuestions[currentIndex];
  const radios = quizContainer.querySelectorAll(`input[name="q${currentIndex}"]`);
  radios.forEach(r => {
    r.disabled = true;
    const label = r.parentElement;
    const val = parseInt(r.value);
    label.classList.remove("correct", "wrong");
    const icon = label.querySelector(".feedback-icon");
    if (val === q.answer) {
      label.classList.add("correct");
      icon.textContent = "check_circle";
      icon.style.color = "#155724";
    } else if (answers[currentIndex] === val && val !== q.answer) {
      label.classList.add("wrong");
      icon.textContent = "cancel";
      icon.style.color = "#721c24";
    } else {
      icon.textContent = "";
    }
  });
}

// Navigation
nextBtn.addEventListener("click", () => {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion(currentIndex);
  }
});
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion(currentIndex);
  }
});

// Submit
submitBtn.addEventListener("click", () => {
  quizPopup.classList.remove("active");
  resultPopup.classList.add("active");
  resultDiv.innerHTML = `<h3>Your Score: ${score} / ${currentQuestions.length}</h3>`;
});

// Try Again
tryAgainBtn.addEventListener("click", () => {
  resultPopup.classList.remove("active");
  configPopup.classList.add("active");
});

const translations = {
  en: {
    selectSubject: "Select Subject",
    startQuiz: "Start Quiz",
    previous: "Previous",
    next: "Next",
    submit: "Submit",
    tryAgain: "Try Again",
    quizCompleted: "Quiz Completed ✅",
    score: "Score"
  },
  or: {
    selectSubject: "ବିଷୟ ଚୟନ କରନ୍ତୁ",
    startQuiz: "କୁଇଜ୍ ଆରମ୍ଭ କରନ୍ତୁ",
    previous: "ପୂର୍ବବର୍ତ୍ତୀ",
    next: "ପରବର୍ତ୍ତୀ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    tryAgain: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
    quizCompleted: "କୁଇଜ୍ ସମାପ୍ତ ✅",
    score: "ଅଂକ"
  }
};

document.getElementById("language-select").addEventListener("change", function () {
  const lang = this.value;
  document.querySelector("#config-popup h2").textContent = translations[lang].selectSubject;
  document.getElementById("start-btn").textContent = translations[lang].startQuiz;
  document.getElementById("prev-btn").textContent = translations[lang].previous;
  document.getElementById("next-btn").textContent = translations[lang].next;
  document.getElementById("submit-btn").textContent = translations[lang].submit;
  document.getElementById("try-again-btn").textContent = translations[lang].tryAgain;
  document.querySelector("#result-popup h2").textContent = translations[lang].quizCompleted;
});

