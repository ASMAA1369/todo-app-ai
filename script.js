// === Sélecteurs ===
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const search = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");
const category = document.getElementById("category");
const deadline = document.getElementById("deadline");
const stats = {
  total: document.getElementById("stat-total"),
  done: document.getElementById("stat-done"),
  left: document.getElementById("stat-left"),
};
const progressFill = document.getElementById("progress-fill");
const toast = document.getElementById("toast");
const themeBtn = document.getElementById("toggle-theme");
const exportBtn = document.getElementById("export-btn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// === Thème ===
function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}
themeBtn.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") setTheme(true);

// === Toast ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// === Sauvegarde et rendu ===
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
function renderTodos() {
  list.innerHTML = "";
  const query = search.value.toLowerCase();
  let countDone = 0;

  todos
    .filter((todo) => {
      if (currentFilter === "completed" && !todo.done) return false;
      if (currentFilter === "active" && todo.done) return false;
      if (!todo.text.toLowerCase().includes(query)) return false;
      return true;
    })
    .forEach((todo, index) => {
      const li = document.createElement("li");
      if (todo.done) li.classList.add("completed");

      const overdue = todo.deadline && new Date(todo.deadline) < new Date();
      if (todo.done) countDone++;

      li.innerHTML = `
        <div>
          <span>${todo.text}</span>
          <div class="meta">
            📅 ${todo.deadline || "Aucune date"} 
            • 🏷 ${todo.category || "Général"} 
            ${overdue && !todo.done ? "• ⚠️ En retard" : ""}
          </div>
        </div>
        <div class="buttons">
          <button class="done" onclick="toggleDone(${index})">✔</button>
          <button class="edit" onclick="editTodo(${index})">✏️</button>
          <button class="delete" onclick="deleteTodo(${index})">🗑</button>
        </div>
      `;
      list.appendChild(li);
    });

  stats.total.textContent = todos.length;
  stats.done.textContent = countDone;
  stats.left.textContent = todos.length - countDone;
  const percent = todos.length > 0 ? (countDone / todos.length) * 100 : 0;
  progressFill.style.width = `${percent}%`;
}

// === Ajouter une tâche ===
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const cat = category.value;
  const date = deadline.value;

  if (text) {
    todos.push({
      text,
      done: false,
      category: cat,
      deadline: date,
      createdAt: new Date().toISOString(),
    });
    input.value = "";
    deadline.value = "";
    saveTodos();
    renderTodos();
    showToast("✅ Tâche ajoutée !");
  }
});

// === Modifier ===
function editTodo(index) {
  const newText = prompt("Modifier la tâche :", todos[index].text);
  if (newText && newText.trim()) {
    todos[index].text = newText.trim();
    saveTodos();
    renderTodos();
    showToast("✏️ Modifiée !");
  }
}

// === Supprimer ===
function deleteTodo(index) {
  const deleted = todos.splice(index, 1);
  saveTodos();
  renderTodos();
  showToast(`🗑 Supprimée : "${deleted[0].text}"`);
}

// === Terminer ===
function toggleDone(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();
}

// === Recherche & filtre ===
search.addEventListener("input", renderTodos);
filterStatus.addEventListener("change", (e) => {
  currentFilter = e.target.value;
  renderTodos();
});

// === Export JSON ===
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "todo-export.json";
  link.click();
});

// === Notification à l'échéance (optionnel local setTimeout) ===
setInterval(() => {
  todos.forEach((todo, index) => {
    if (
      !todo.done &&
      todo.deadline &&
      new Date(todo.deadline).toDateString() === new Date().toDateString() &&
      !todo.notified
    ) {
      showToast(`⏰ Rappel : "${todo.text}" est pour aujourd’hui !`);
      todos[index].notified = true;
      saveTodos();
    }
  });
}, 60 * 1000); // vérifie chaque minute

renderTodos();
