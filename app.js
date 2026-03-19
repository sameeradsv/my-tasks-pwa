// ── Theme definitions ──
// Each theme has: a display name, accent colours for UI elements,
// and a CSS class name that drives the animated background.
const THEMES = ['aurora', 'sunset', 'ocean', 'dusk', 'forest'];
const THEME_KEY = 'my_tasks_theme';
const THEME_META = {
  aurora:  { name: 'Aurora',  accent: '#7dd3fc', accent2: '#c084fc', text: '#e0f2fe', textMuted: '#bae6fd' },
  sunset:  { name: 'Sunset',  accent: '#fb923c', accent2: '#f472b6', text: '#fff1f2', textMuted: '#fecdd3' },
  ocean:   { name: 'Ocean',   accent: '#34d399', accent2: '#38bdf8', text: '#ecfdf5', textMuted: '#a7f3d0' },
  dusk:    { name: 'Dusk',    accent: '#fbbf24', accent2: '#a78bfa', text: '#fdf4ff', textMuted: '#e9d5ff' },
  forest:  { name: 'Forest',  accent: '#86efac', accent2: '#d97706', text: '#f0fdf4', textMuted: '#bbf7d0' },
};

let autoRotateTimer = null;

function applyTheme(theme, save = true) {
  // Remove all theme classes from body
  THEMES.forEach(t => document.body.classList.remove('theme-' + t));
  // Add new theme class (drives CSS animated background)
  document.body.classList.add('theme-' + theme);
  document.body.setAttribute('data-theme', theme);

  // Update CSS variables for UI accent colours
  const meta = THEME_META[theme];
  if (meta) {
    const root = document.documentElement;
    root.style.setProperty('--accent', meta.accent);
    root.style.setProperty('--accent2', meta.accent2);
    root.style.setProperty('--accent-gradient', `linear-gradient(90deg, ${meta.accent}, ${meta.accent2})`);
    root.style.setProperty('--text', meta.text);
    root.style.setProperty('--text-muted', meta.textMuted);
  }


  if (save) localStorage.setItem(THEME_KEY, theme);
}

function nextTheme() {
  const current = document.body.getAttribute('data-theme') || 'aurora';
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

function startAutoRotate() {
  if (autoRotateTimer) clearInterval(autoRotateTimer);
  // Rotate every 5 minutes (300000 ms)
  autoRotateTimer = setInterval(() => {
    applyTheme(nextTheme());
  }, 300000);
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
  tasks.push({ id: Date.now(), text: text.trim(), completed: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
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
    delBtn.textContent = '\u2715';
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
