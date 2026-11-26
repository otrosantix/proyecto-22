// Segundos disponibles por pregunta
const QUESTION_TIME = 60;

// Estado del quiz
let index = 0;
let score = 0;
let results = [];
let timeLeft = QUESTION_TIME;
let timerId = null;
let answered = false;

const $ = function (id) { return document.getElementById(id); };
const screens = { start: $("start"), quiz: $("quiz"), result: $("result") };

// Muestra solo la pantalla indicada
function show(name) {
  Object.keys(screens).forEach(function (key) {
    screens[key].hidden = key !== name;
  });
}

function startQuiz() {
  index = 0;
  score = 0;
  results = [];
  show("quiz");
  showQuestion();
}

// Dibuja la pregunta actual con sus botones de respuesta
function showQuestion() {
  const q = QUESTIONS[index];
  answered = false;
  $("progress").textContent = "Pregunta " + (index + 1) + " de " + QUESTIONS.length;
  $("question").textContent = q.question;
  $("feedback").textContent = "";
  $("next-btn").hidden = true;
  $("answers").innerHTML = "";
  q.options.forEach(function (text, i) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", function () { selectAnswer(i); });
    $("answers").appendChild(btn);
  });
  startTimer();
}

// Cuenta regresiva de la pregunta
function startTimer() {
  clearInterval(timerId);
  timeLeft = QUESTION_TIME;
  $("timer").textContent = timeLeft + " s";
  timerId = setInterval(function () {
    timeLeft -= 1;
    $("timer").textContent = timeLeft + " s";
    if (timeLeft <= 0) timeout();
  }, 1000);
}

// Marca la respuesta elegida y muestra cual era la correcta
function selectAnswer(i) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);
  const q = QUESTIONS[index];
  const isCorrect = i === q.answer;
  if (isCorrect) score += 1;
  const buttons = $("answers").querySelectorAll("button");
  buttons.forEach(function (btn, j) {
    btn.disabled = true;
    if (j === q.answer) btn.classList.add("correct");
    else if (j === i) btn.classList.add("wrong");
  });
  results.push({
    question: q.question,
    chosen: q.options[i],
    correct: q.options[q.answer],
    isCorrect: isCorrect
  });
  $("feedback").textContent = isCorrect
    ? "Correcto"
    : "Incorrecto. La respuesta correcta era: " + q.options[q.answer];
  $("next-btn").textContent = index === QUESTIONS.length - 1 ? "Ver resultado" : "Siguiente";
  $("next-btn").hidden = false;
  $("next-btn").focus();
}

// Si se acaba el tiempo se resta un punto y se pasa a la siguiente pregunta
function timeout() {
  clearInterval(timerId);
  const q = QUESTIONS[index];
  score -= 1;
  results.push({
    question: q.question,
    chosen: null,
    correct: q.options[q.answer],
    isCorrect: false
  });
  advance();
}

function advance() {
  index += 1;
  if (index < QUESTIONS.length) showQuestion();
  else showResult();
}

// Muestra el puntaje final y el detalle de cada pregunta
function showResult() {
  show("result");
  $("score").textContent = score + " de " + QUESTIONS.length;
  $("results").innerHTML = "";
  results.forEach(function (r) {
    const li = document.createElement("li");
    li.className = r.isCorrect ? "ok" : "fail";
    const chosen = r.chosen === null ? "Sin respuesta (-1 punto)" : r.chosen;
    li.textContent = r.question + " Tu respuesta: " + chosen + ". Correcta: " + r.correct + ".";
    $("results").appendChild(li);
  });
}

$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", advance);
$("restart-btn").addEventListener("click", function () { show("start"); });
