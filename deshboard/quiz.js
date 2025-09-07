document.addEventListener("DOMContentLoaded", function() {
  // Timer variables
  
  let timer = null;
  let timerDuration = 20; // seconds per question
  let timerRemaining = timerDuration;
  

  // Load questions from localStorage (admin panel)
  const STORAGE_KEY = "quiz_questions_data";
  function loadQuestions() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
    // fallback to default if nothing in storage
    return {
      programming: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "Home Tool Markup Language",
            "Hyperlinks and Text Markup Language",
            "Hyper Tool Multi Language"
          ],
          answer: 0
        }
      ],
      geography: [
        {
          question: "Which is the largest continent?",
          options: ["Africa", "Asia", "Europe", "Australia"],
          answer: 1
        }
      ],
      mathematics: [
        {
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          answer: 1
        }
      ],
      entertainment: [
        {
          question: "Who is known as the King of Pop?",
          options: ["Elvis Presley", "Michael Jackson", "Freddie Mercury", "Prince"],
          answer: 1
        }
      ]
    };
  }
  const questionsData = loadQuestions();

  // Subject select population
  const subjectSelect = document.getElementById("subject");
  if (subjectSelect && subjectSelect.options.length <= 1) {
    Object.keys(questionsData).forEach(subj => {
      const opt = document.createElement("option");
      opt.value = subj;
      opt.textContent = subj.charAt(0).toUpperCase() + subj.slice(1);
      subjectSelect.appendChild(opt);
    });
  }

  let currentQuestions = [];
  let currentIndex = 0;
  let userAnswers = [];
  let score = 0;

  function updateScoreBox() {
    const scoreBox = document.getElementById("score-box");
    if (scoreBox) {
      scoreBox.textContent = `Score: ${score} / ${currentQuestions.length}`;
    }
  }

  function startTimer(onTimeout) {
    clearInterval(timer);
    timerRemaining = timerDuration;
    updateTimerBar();
    timer = setInterval(() => {
      timerRemaining--;
      updateTimerBar();
      if (timerRemaining <= 0) {
        clearInterval(timer);
        if (typeof onTimeout === "function") onTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function updateTimerBar() {
  let bar = document.getElementById("timer-bar");
  if (!bar) return;
  const percent = (timerRemaining / timerDuration);
  bar.style.width = (percent * 100) + "%";
  bar.textContent = timerRemaining > 0 ? timerRemaining + "s" : "";

  // Color: green when full, yellow in the middle, red when low
  if (percent > 0.5) {
    bar.style.background = "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"; // green
  } else if (percent > 0.2) {
    bar.style.background = "linear-gradient(90deg, #f9d423 0%, #ff4e50 100%)"; // yellow-orange
  } else {
    bar.style.background = "linear-gradient(90deg, #ff5858 0%, #f09819 100%)"; // red
    bar.style.animation = "timer-blink 0.7s infinite";
  }

  // Remove blink if not in warning
  if (percent > 0.2) {
    bar.style.animation = "";
  }
}

  function showQuestion(index) {
    stopTimer();
    const quizContainer = document.getElementById("quiz-container");
    if (!quizContainer) return;
    if (!currentQuestions[index]) return;
    const q = currentQuestions[index];
    quizContainer.innerHTML = `
      <div style="position:relative;">
        <div class="question">${q.question}</div>
      </div>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label>
            <input type="radio" name="option" value="${i}" ${userAnswers[index] !== undefined ? 'disabled' : ''} ${userAnswers[index] === i ? 'checked' : ''}>
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    `;

    // Option selection logic
    const optionInputs = quizContainer.querySelectorAll('input[type="radio"][name="option"]');
    optionInputs.forEach(input => {
      input.addEventListener('change', function() {
        optionInputs.forEach(inp => inp.disabled = true);
        const selected = parseInt(this.value, 10);
        userAnswers[index] = selected;
        const labels = quizContainer.querySelectorAll('.options label');
        if (selected === q.answer) {
          labels[selected].classList.add('correct');
          score++;
        } else {
          labels[selected].classList.add('wrong');
          labels[q.answer].classList.add('correct');
        }
        updateScoreBox();
        stopTimer();
      });
    });

    // If already answered, show correct/wrong colors
    if (userAnswers[index] !== undefined) {
      const labels = quizContainer.querySelectorAll('.options label');
      const selected = userAnswers[index];
      optionInputs.forEach(inp => inp.disabled = true);
      if (selected === q.answer) {
        labels[selected].classList.add('correct');
      } else {
        labels[selected].classList.add('wrong');
        labels[q.answer].classList.add('correct');
      }
      updateScoreBox();
    } else {
      // Start timer for unanswered question
      startTimer(() => {
        // On timeout: auto-select "No Answer" and move to next
        userAnswers[index] = undefined;
        optionInputs.forEach(inp => inp.disabled = true);
        const labels = quizContainer.querySelectorAll('.options label');
        if (labels.length && currentQuestions[index]) {
          labels[currentQuestions[index].answer].classList.add('correct');
        }
        setTimeout(() => {
          if (currentIndex < currentQuestions.length - 1) {
            currentIndex++;
            showQuestion(currentIndex);
          } else {
            document.getElementById("submit-btn").click();
          }
        }, 1000);
      });
    }
    updateScoreBox();
  }

  // Navigation and submit logic
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const resultPopup = document.getElementById("result-popup");
  const quizPopup = document.getElementById("quiz-popup");
  const resultDiv = document.getElementById("result");
  const tryAgainBtn = document.getElementById("try-again-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", function() {
      stopTimer();
      if (currentIndex > 0) {
        currentIndex--;
        showQuestion(currentIndex);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function() {
      stopTimer();
      if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        showQuestion(currentIndex);
      }
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      stopTimer();
      quizPopup.classList.remove("active");
      resultPopup.classList.add("active");
      document.getElementById("result-subject-name").textContent = "Subject: " + currentSubject;
      resultDiv.innerHTML = `
        <div style="font-size:1.3rem;font-weight:600;margin-bottom:1rem;">
          Your Score: ${score} / ${currentQuestions.length}
        </div>
        <div>
          ${currentQuestions.map((q, i) => `
            <div style="margin-bottom:0.7rem;">
              <div><b>Q${i+1}:</b> ${q.question}</div>
              <div>
                <span style="color:${userAnswers[i] === q.answer ? '#43e97b' : '#ff5858'};">
                  Your Answer: ${q.options[userAnswers[i]] || 'No Answer'}
                </span>
                <br>
                <span style="color:#2575fc;">
                  Correct Answer: ${q.options[q.answer]}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });
  }
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", function() {
      stopTimer();
      resultPopup.classList.remove("active");
      document.getElementById("config-popup").classList.add("active");
      // Reset state
      currentQuestions = [];
      currentIndex = 0;
      userAnswers = [];
      score = 0;
      updateScoreBox();
      updateTimerBar();
    });
  }

  // Start Quiz button logic
  let currentSubject = "";
  const startBtn = document.getElementById("start-btn");
  const configPopup = document.getElementById("config-popup");

  if (startBtn && configPopup && quizPopup) 
    startBtn.addEventListener("click", function() {
      stopTimer();
      if (!subjectSelect.value) {
        alert("Please select a subject!");
        return;
      }
      currentSubject = subjectSelect.options[subjectSelect.selectedIndex].textContent;
      document.getElementById("subject-name").textContent = "Subject: " + currentSubject;
      currentQuestions = questionsData[subjectSelect.value] || [];
      currentIndex = 0;
      userAnswers = [];
      score = 0;
      if (currentQuestions.length === 0) {
        alert("No questions available for this subject.");
        return;
      }
      configPopup.classList.remove("active");
      quizPopup.classList.add("active");
      resultPopup.classList.remove("active");
      showQuestion(currentIndex);
    });
});