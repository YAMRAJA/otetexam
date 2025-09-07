const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const user = document.getElementById("username").value;
      const pass = document.getElementById("password").value;

      if(user === "admin" && pass === "admin123"){
        window.location.href = "deshboard/admin.html";  
      } else if(user === "user" && pass === "user123"){
        window.location.href = "deshboard/quiz.html";   
      } else {
        document.getElementById("error-msg").textContent = "Invalid Login!";
      }
    });