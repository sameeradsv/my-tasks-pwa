// ── Theme management ──
const THEMES = ['slate', 'forest', 'ocean', 'dusk', 'graphite', 'cocoa'];
const THEME_KEY = 'my_tasks_theme';
const THEME_NAMES = {
  slate:    'Slate',
  forest:   'Forest',
  ocean:    'Ocean',
  dusk:     'Dusk',
  graphite: 'Graphite',
  cocoa:    'Cocoa'
};

let autoRotateTimer = null;

function applyTheme(theme, save = true) {
  document.body.setAttribute('data-theme', theme);
  // Update active dot
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === theme);
  });
  // Update label
  const label = document.getElementById('theme-label');
  if (label) label.textContent = THEME_NAMES[theme] || theme;
  // Persist
  if (save) localStorage.setItem(THEME_KEY, theme);
}

function startAutoRotate() {
  if (autoRotateTimer) clearInterval(autoRotateTimer);
  autoRotateTimer = setInterval(() => {
    const current = document.body.getAttribute('data-theme') || 'slate';
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next);
  }, 30000); // rotate every 30 seconds
}

function stopAutoRotate() {
  if (autoRotateTimer) {
    clearInterval(autoRotateTimer);
    autoRotateTimer = null;
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved && THEMES.includes(saved) ? saved : THEMES[0];
  applyTheme(theme, false);
  startAutoRotate();

  // Theme dot click handlers
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoRotate();
      applyTheme(dot.dataset.theme);
      // Resume auto-rotate after 2 minutes of manual selection
      setTimeout(startAutoRotate, 120000);
    });
  });
}

// ── Task management ──
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
  if (currentFilter === 'pending')   return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function renderTasks() {
  list.innerHTML = '';
  const visible = filteredTasks();

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    const msgs = {
      all:       'No tasks yet. Add one above!',
      pending:   'All caught up! No pending tasks.',
      completed: 'Nothing completed yet.'
    };
    empty.textContent = msgs[currentFilter] || 'No tasks here.';
    list.appendChild(empty);
    return;
  }

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark task complete');
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

// ── Init ──
initTheme();
loadTasks();
