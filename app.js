const STORAGE_KEY = 'my_tasks_v1';

let tasks = [];
let currentFilter = 'all';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filters button');

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.push({
    id: Date.now(),
    text: text.trim(),
    completed: false
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

function filteredTasks() {
  if (currentFilter === 'pending') return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function renderTasks() {
  list.innerHTML = '';
  const visible = filteredTasks();

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'text-align:center;color:#6b7280;padding:2rem 0;';
    empty.textContent = 'No tasks here.';
    list.appendChild(empty);
    return;
  }

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const delBtn = document.createElement('button');
    delBtn.textContent = 'x';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(delBtn);
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

loadTasks();
