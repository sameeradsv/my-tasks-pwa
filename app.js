// ── Theme definitions (keeping original themes) ──
const THEMES = ['aurora', 'sunset', 'ocean', 'dusk', 'forest'];
const THEME_KEY = 'my_tasks_theme';
const THEME_META = {
  aurora:  { name: 'Aurora',  accent: '#7dd3fc', accent2: '#c084fc', text: '#e0f2fe', textMuted: '#bae6fd' },
  sunset:  { name: 'Sunset',  accent: '#fb923c', accent2: '#f472b6', text: '#fff1f2', textMuted: '#fecdd3' },
  ocean:   { name: 'Ocean',   accent: '#34d399', accent2: '#38bdf8', text: '#ecfdf5', textMuted: '#a7f3d0' },
  dusk:    { name: 'Dusk',    accent: '#fbbf24', accent2: '#a78bfa', text: '#fdf4ff', textMuted: '#e9d5ff' },
  forest:  { name: 'Forest',  accent: '#86efac', accent2: '#d97706', text: '#f0fdf4', textMuted: '#bbf7d0' },
};

function applyTheme(theme, save = true) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t));
  document.body.classList.add('theme-' + theme);
  document.body.setAttribute('data-theme', theme);
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

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved && THEMES.includes(saved) ? saved : THEMES[0];
  applyTheme(theme, false);
}

// ── Energy Modes ──
const MODE_KEY = 'my_tasks_mode';
let currentMode = 'normal';

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem(MODE_KEY, mode);
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const pill = document.getElementById('mode-display');
  if (pill) {
    const names = { normal: 'Normal', deep: 'Deep Work', low: 'Low Energy', social: 'Social Recovery' };
    pill.textContent = names[mode] || mode;
  }
  renderTasks();
  updateSnapshot();
}

function initModes() {
  const saved = localStorage.getItem(MODE_KEY) || 'normal';
  currentMode = saved;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
  const pill = document.getElementById('mode-display');
  if (pill) {
    pill.addEventListener('click', () => {
      const modeSelector = document.getElementById('mode-selector');
      if (modeSelector) modeSelector.classList.toggle('visible');
    });
  }
  setMode(saved);
}

// ── Task management ──
const STORAGE_KEY = 'my_tasks_v2';
let tasks = [];
let currentFilter = 'all';
let selectedTag = 'general';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filters button');
const tagButtons = document.querySelectorAll('.tag-btn');

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
    tasks = tasks.map(t => ({
      id: t.id || Date.now(),
      text: t.text || '',
      completed: t.completed || false,
      tag: t.tag || 'general',
      tinyStep: t.tinyStep || '',
      effort: t.effort || 'medium',
      createdAt: t.createdAt || Date.now()
    }));
  } catch {
    tasks = [];
  }
  renderTasks();
  updateSnapshot();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.push({
    id: Date.now(),
    text: text.trim(),
    completed: false,
    tag: selectedTag,
    tinyStep: '',
    effort: 'medium',
    createdAt: Date.now()
  });
  saveTasks();
  renderTasks();
  updateSnapshot();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
  updateSnapshot();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateSnapshot();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

function setTag(tag) {
  selectedTag = tag;
  tagButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === tag);
  });
}

function filteredTasks() {
  let filtered = tasks;
  if (currentFilter === 'pending') filtered = filtered.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = filtered.filter(t => t.completed);
  if (currentFilter === 'today') {
    const today = new Date().setHours(0,0,0,0);
    filtered = filtered.filter(t => !t.completed && (new Date(t.createdAt).setHours(0,0,0,0) === today || t.tag === 'work'));
  }
  if (currentMode === 'low') {
    filtered = filtered.filter(t => !t.completed && (t.tinyStep || t.effort === 'low'));
  } else if (currentMode === 'deep') {
    filtered = filtered.filter(t => !t.completed && t.tag === 'work');
  } else if (currentMode === 'social') {
    filtered = filtered.filter(t => t.tag !== 'social' && !t.completed);
  }
  return filtered;
}

function updateSnapshot() {
  const banner = document.getElementById('snapshot-banner');
  if (!banner) return;
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  const today = filteredTasks();
  let msg = '';
  if (currentMode === 'low') {
    msg = `Low-energy mode: ${today.length} simple tasks available`;
  } else if (currentMode === 'deep') {
    msg = `Deep work: ${today.length} focus tasks`;
  } else if (currentMode === 'social') {
    msg = `Social recovery: ${today.length} non-social tasks`;
  } else {
    msg = `Today: ${pending.length} pending, ${completed.length} done`;
  }
  banner.textContent = msg;
  banner.style.display = 'block';
}

function openTinyStepModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  const overlay = document.getElementById('nts-overlay');
  const taskName = document.getElementById('nts-task-name');
  const input = document.getElementById('nts-input');
  if (!overlay || !taskName || !input) return;
  taskName.textContent = task.text;
  input.value = task.tinyStep || '';
  overlay.removeAttribute('hidden');
  input.focus();
  const saveBtn = document.getElementById('nts-save');
  const cancelBtn = document.getElementById('nts-cancel');
  const save = () => {
    task.tinyStep = input.value.trim();
    saveTasks();
    renderTasks();
    overlay.setAttribute('hidden', '');
  };
  const cancel = () => {
    overlay.setAttribute('hidden', '');
  };
  saveBtn.onclick = save;
  cancelBtn.onclick = cancel;
  overlay.onclick = (e) => {
    if (e.target === overlay) cancel();
  };
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
      completed: 'Nothing completed yet.',
      today:     'Nothing urgent for today.'
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
    const content = document.createElement('div');
    content.className = 'task-content';
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    content.appendChild(span);
    if (task.tinyStep) {
      const step = document.createElement('div');
      step.className = 'tiny-step';
      step.textContent = '→ ' + task.tinyStep;
      content.appendChild(step);
    }
    const tagBadge = document.createElement('span');
    tagBadge.className = 'task-tag-badge';
    tagBadge.textContent = task.tag;
    content.appendChild(tagBadge);
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    if (!task.completed) {
      const stepBtn = document.createElement('button');
      stepBtn.textContent = '⚡';
      stepBtn.title = 'Set next tiny step';
      stepBtn.addEventListener('click', () => openTinyStepModal(task.id));
      actions.appendChild(stepBtn);
    }
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', () => deleteTask(task.id));
    actions.appendChild(delBtn);
    li.appendChild(checkbox);
    li.appendChild(content);
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

tagButtons.forEach(btn => {
  btn.addEventListener('click', () => setTag(btn.dataset.tag));
});

initTheme();
initModes();
loadTasks();
