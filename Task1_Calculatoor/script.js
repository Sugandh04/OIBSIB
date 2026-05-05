let display = document.getElementById("display");
let historyList = document.getElementById("historyList");

// Add value to the display
function appendValue(value) {
  let last = display.value.slice(-1);

  // Prevent multiple basic operators in a row
  if (["+", "-", "*", "/", "%", "^"].includes(last) && ["+", "-", "*", "/", "%", "^"].includes(value)) {
    return;
  }

  // If display shows Error, clear it first
  if (display.value === "Error") {
    display.value = "";
  }

  display.value += value;
}

// Add function to the display (like sin(, log()
function appendFunction(func) {
  if (display.value === "Error") {
    display.value = "";
  }
  display.value += func;
}

// Clear entire display
function clearDisplay() {
  display.value = "";
}

// Delete last character
function deleteLast() {
  if (display.value === "Error") {
    display.value = "";
  } else {
    display.value = display.value.slice(0, -1);
  }
}

// Calculate the expression natively
function calculate() {
  if (!display.value) return;

  try {
    let expression = display.value;
    
    // Pre-process the expression to use native Math functions
    let parsedExpression = expression
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/log10\(/g, "Math.log10(")
      .replace(/log\(/g, "Math.log(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/pi/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/\^/g, "**");

    // Using Function instead of eval for slightly better scoping, though both are risky if inputs aren't sanitized.
    // However, our input is restricted by the buttons and basic keydown filters.
    let result = new Function('return ' + parsedExpression)();

    // Prevent floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
    if (result % 1 !== 0) {
        result = parseFloat(result.toFixed(10));
    }

    // Save to history
    addHistoryItem(expression, result);

    display.value = result;
  } catch (error) {
    display.value = "Error";
    console.error("Evaluation Error:", error);
  }
}

// Add item to history list
function addHistoryItem(expression, result) {
  let li = document.createElement("li");
  li.textContent = `${expression} = ${result}`;
  li.onclick = () => {
    // When history item is clicked, put the expression back into display
    if (display.value === "Error") display.value = "";
    display.value = expression;
  };
  
  historyList.prepend(li);
}

// Clear history
function clearHistory() {
  historyList.innerHTML = "";
}

// Keyboard Support
document.addEventListener("keydown", (event) => {
  let key = event.key;

  // Basic numbers and operators
  if (!isNaN(key) || ["+", "-", "*", "/", ".", "%", "^", "(", ")"].includes(key)) {
    appendValue(key);
  }

  if (key === "Enter" || key === "=") {
    calculate();
  }

  if (key === "Backspace") {
    deleteLast();
  }

  if (key === "Escape") {
    clearDisplay();
  }
  
  // Quick shortcuts for math constants/functions
  if (key.toLowerCase() === 'p') appendValue('pi');
  if (key.toLowerCase() === 'e') appendValue('e');
  if (key.toLowerCase() === 's') appendFunction('sin(');
  if (key.toLowerCase() === 'c') appendFunction('cos(');
  if (key.toLowerCase() === 't') appendFunction('tan(');
});

// Theme Toggle Logic
function toggleMode() {
  let body = document.body;
  let iconMoon = document.querySelector(".icon-moon");
  let iconSun = document.querySelector(".icon-sun");

  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    iconMoon.style.display = "block";
    iconSun.style.display = "none";
  } else {
    iconMoon.style.display = "none";
    iconSun.style.display = "block";
  }
}