const workInput = document.getElementById("workTime");
const breakInput = document.getElementById("breakTime");
const timeDisplay = document.getElementById("time");
const modeDisplay = document.getElementById("mode");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const popup = document.getElementById("popup");
const progress = document.getElementById("progress");
const ding = document.getElementById("ding");
const themeToggle = document.getElementById("themeToggle");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const pomodoroCountDisplay = document.getElementById("pomodoroCount");

let timer = null;
let total = 0;
let remaining = 0;
let cycleCount = 0;
let isPausedAfterBreak = false;

const MAX_CYCLES = 4;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function updateProgress() {
  const circleLength = 2 * Math.PI * 90;
  const offset = circleLength * (1 - remaining / total);
  progress.style.strokeDashoffset = offset;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remaining);
  updateProgress();
}

function notify(message) {
  if (Notification.permission === "granted") {
    new Notification("Pomodoro Timer", { body: message });
  }
}

function startInterval(type) {
  modeDisplay.textContent = type;
  total = remaining = type === "Work"
    ? parseInt(workInput.value) * 60
    : parseInt(breakInput.value) * 60;

  updateDisplay();
  clearInterval(timer);

  timer = setInterval(() => {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      clearInterval(timer);
      ding.play();

      if (type === "Work") {
        cycleCount++;
        updatePomodoroCount();
        notify(`✅ Work session complete. Cycle ${cycleCount}/${MAX_CYCLES}`);
        if (cycleCount >= MAX_CYCLES) {
          completePomodoro();
        } else {
          startInterval("Break");
        }
      } else if (!isPausedAfterBreak) {
        isPausedAfterBreak = true;
        notify("⏸️ Short 5-minute pause");
        startPause();
      } else {
        isPausedAfterBreak = false;
        startInterval("Work");
      }
    }
  }, 1000);
}

function startPause() {
  modeDisplay.textContent = "Paused";
  total = remaining = 5 * 60;
  updateDisplay();
  timer = setInterval(() => {
    remaining--;
    updateDisplay();
    if (remaining <= 0) {
      clearInterval(timer);
      ding.play();
      startInterval("Work");
    }
  }, 1000);
}

function completePomodoro() {
  modeDisplay.textContent = "Done!";
  timeDisplay.textContent = "00:00";
  progress.style.strokeDashoffset = 0;
  popup.style.display = "block";
  notify("🎉 All Pomodoro cycles complete!");
  ding.play();
}

function resetTimer() {
  clearInterval(timer);
  cycleCount = 0;
  isPausedAfterBreak = false;
  modeDisplay.textContent = "Work";
  remaining = parseInt(workInput.value) * 60;
  updateDisplay();
  popup.style.display = "none";
}

startBtn.addEventListener("click", () => {
  popup.style.display = "none";
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  startInterval("Work");
});

resetBtn.addEventListener("click", resetTimer);

themeToggle.addEventListener("change", (e) => {
  document.body.className = e.target.value;
});

addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;
    taskList.appendChild(li);
    taskInput.value = "";
  }
});

function updatePomodoroCount() {
  pomodoroCountDisplay.textContent = cycleCount;
}

// Initialize the timer display
updateDisplay();
 
