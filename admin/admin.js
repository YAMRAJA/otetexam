document.addEventListener("DOMContentLoaded", function() {
  const STORAGE_KEY = "quiz_questions_data";
  const defaultQuestions = {
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

  function loadQuestions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : JSON.parse(JSON.stringify(defaultQuestions));
  }

  function saveQuestions(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let questionsData = loadQuestions();

  // Elements
  const subjectSelect = document.getElementById("admin-subject");
  const questionList = document.getElementById("question-list");
  const addBtn = document.getElementById("add-question-btn");
  const addSubjectBtn = document.getElementById("add-subject-btn");
  const renameSubjectBtn = document.getElementById("rename-subject-btn");
  const removeSubjectBtn = document.getElementById("remove-subject-btn");
  const editModal = document.getElementById("admin-edit-modal");
  const editForm = document.getElementById("admin-edit-form");
  const uploadInput = document.getElementById("upload-template");
  let editIndex = null;

  // Populate subject dropdown
  function populateSubjects() {
    subjectSelect.innerHTML = "";
    Object.keys(questionsData).forEach(subj => {
      const opt = document.createElement("option");
      opt.value = subj;
      opt.textContent = subj.charAt(0).toUpperCase() + subj.slice(1);
      subjectSelect.appendChild(opt);
    });
    if (subjectSelect.options.length > 0) subjectSelect.selectedIndex = 0;
  }

  // Render question list
  function renderQuestions() {
    const subject = subjectSelect.value;
    questionList.innerHTML = "";
    if (!subject || !questionsData[subject] || questionsData[subject].length === 0) {
      questionList.innerHTML = "<li>No questions available.</li>";
      return;
    }
    questionsData[subject].forEach((q, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>Q${idx + 1}:</b> ${q.question}
        <ul>
          ${q.options.map((opt, i) => `
            <li${i === q.answer ? ' style="color:#43e97b;font-weight:bold;"' : ''}>
              ${String.fromCharCode(65 + i)}. ${opt}
              ${i === q.answer ? ' <span style="font-size:0.9em;">(Correct)</span>' : ''}
            </li>
          `).join("")}
        </ul>
        <button class="edit-btn" data-idx="${idx}">Edit</button>
        <button class="delete-btn" data-idx="${idx}">Delete</button>
      `;
      questionList.appendChild(li);
    });
  }

  // Add/Edit Modal logic
  function openEditModal(isEdit, idx = null) {
    editModal.classList.add("active");
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
    let optionCount = 4;
    let optionValues = ["", "", "", ""];
    let answerValue = 1;
    if (isEdit && idx !== null) {
      editIndex = idx;
      const subject = subjectSelect.value;
      const q = questionsData[subject][idx];
      editForm["admin-question"].value = q.question;
      optionCount = q.options.length;
      optionValues = q.options.slice();
      answerValue = q.answer + 1;
    } else {
      editIndex = null;
      editForm.reset();
    }
    for (let i = 0; i < optionCount; i++) {
      addOptionInput(optionsContainer, i, optionValues[i] || "");
    }
    document.getElementById("admin-answer").value = answerValue;

    // Add option button logic
    document.getElementById("add-option-btn").onclick = function() {
      addOptionInput(optionsContainer, optionsContainer.children.length, "");
    };

    modalOptionRemoveHandler(optionsContainer);

    editModal.classList.add("active");
  }

  // Add option input field
  function addOptionInput(container, idx, value) {
    const div = document.createElement("div");
    div.className = "option-row";
    div.innerHTML = `
      <input type="text" class="option-input" name="admin-opt-${idx}" id="admin-opt-${idx}" required value="${value}">
      <button type="button" class="remove-option-btn" title="Remove Option">&times;</button>
    `;
    container.appendChild(div);
  }

  // Remove option handler
  function modalOptionRemoveHandler(container) {
    container.addEventListener("click", function(e) {
      if (e.target.classList.contains("remove-option-btn")) {
        if (container.children.length > 2) {
          e.target.parentElement.remove();
        } else {
          alert("At least two options are required.");
        }
      }
    });
  }

  // Event: Subject change
  subjectSelect.addEventListener("change", renderQuestions);

  // Event: Add question
  addBtn.addEventListener("click", function() {
    openEditModal(false);
  });

  // Event: Add subject
  addSubjectBtn.addEventListener("click", function() {
    const newSubj = prompt("Enter new subject name:").trim();
    if (!newSubj) return;
    const key = newSubj.toLowerCase().replace(/\s+/g, "_");
    if (questionsData[key]) {
      alert("Subject already exists!");
      return;
    }
    questionsData[key] = [];
    saveQuestions(questionsData);
    populateSubjects();
    subjectSelect.value = key;
    renderQuestions();
  });

    // Event: Rename subject
renameSubjectBtn.addEventListener("click", function() {
  const oldKey = subjectSelect.value;
  if (!oldKey) return;
  const newName = prompt("Enter new subject name:", oldKey.replace(/_/g, " "));
  if (!newName) return;
  const newKey = newName.toLowerCase().replace(/\s+/g, "_");
  if (questionsData[newKey]) {
    alert("A subject with this name already exists!");
    return;
  }
  // Rename subject key and preserve questions
  questionsData[newKey] = questionsData[oldKey];
  delete questionsData[oldKey];
  saveQuestions(questionsData);
  populateSubjects();
  subjectSelect.value = newKey;
  renderQuestions();
});

  // Event: Remove subject
  removeSubjectBtn.addEventListener("click", function() {
    const subj = subjectSelect.value;
    if (!subj) return;
    if (confirm(`Delete subject "${subj}" and all its questions?`)) {
      delete questionsData[subj];
      saveQuestions(questionsData);
      populateSubjects();
      renderQuestions();
    }
  });

  // Event: Edit/Delete buttons
  questionList.addEventListener("click", function(e) {
    const subject = subjectSelect.value;
    if (e.target.classList.contains("edit-btn")) {
      openEditModal(true, parseInt(e.target.dataset.idx, 10));
    }
    if (e.target.classList.contains("delete-btn")) {
      const idx = parseInt(e.target.dataset.idx, 10);
      if (confirm("Delete this question?")) {
        questionsData[subject].splice(idx, 1);
        saveQuestions(questionsData);
        renderQuestions();
      }
    }
  });

  // Event: Modal cancel
  document.getElementById("admin-edit-cancel").onclick = function() {
    editModal.classList.remove("active");
  };

  // Event: Modal save
  editForm.onsubmit = function(e) {
    e.preventDefault();
    const subject = subjectSelect.value;
    const q = {
      question: editForm["admin-question"].value,
      options: [],
      answer: 0
    };
    const optionInputs = document.querySelectorAll(".option-input");
    optionInputs.forEach(input => q.options.push(input.value));
    let ans = parseInt(editForm["admin-answer"].value, 10);
    if (isNaN(ans) || ans < 1 || ans > q.options.length) ans = 1;
    q.answer = ans - 1;
    if (editIndex !== null) {
      questionsData[subject][editIndex] = q;
    } else {
      questionsData[subject].push(q);
    }
    saveQuestions(questionsData);
    editModal.classList.remove("active");
    renderQuestions();
  };

  // Upload CSV logic
  uploadInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      parseCSVAndAddQuestions(text);
    };
    reader.readAsText(file);
    uploadInput.value = "";
  });

  function parseCSVAndAddQuestions(csv) {
    // CSV format: question,opt1,opt2,opt3,opt4,...,correctOptionNumber
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const subject = subjectSelect.value;
    let added = 0;
    lines.forEach(line => {
      const parts = line.split(",");
      if (parts.length < 4) return; // at least question, 2 options, answer
      const question = parts[0];
      const options = parts.slice(1, -1);
      const answer = parseInt(parts[parts.length - 1], 10) - 1;
      if (!question || options.length < 2 || isNaN(answer) || answer < 0 || answer >= options.length) return;
      questionsData[subject].push({ question, options, answer });
      added++;
    });
    saveQuestions(questionsData);
    renderQuestions();
    alert(`${added} questions imported.`);
  }

  // Initial setup
  populateSubjects();
  renderQuestions();
});