// Combine subject files
const questions = [
  { category: "Programming", questions: programmingQuestions },
  { category: "Geography", questions: geographyQuestions },
  { category: "Mathematics", questions: mathematicsQuestions },
  { category: "Entertainment", questions: entertainmentQuestions }
];

// Load extra questions from localStorage
const savedData = JSON.parse(localStorage.getItem("quizData")) || {};
for (let subject in savedData) {
  let subjectObj = questions.find(q => q.category === subject);
  if (subjectObj) {
    subjectObj.questions.push(...savedData[subject]);
  }
}

console.log("Final Questions for Quiz:", questions);
