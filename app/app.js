// GTA VI trophy guide + tracker v2: dashboard (percent, by grade, next 5 easiest),
// 3-phase platinum roadmap, difficulty 1-5 + time per trophy, a fastest-to-platinum
// route sort, per-trophy missable checks, checklist saved in the browser, filters,
// spoiler-safe story trophies, export/import. Static only: the only file fetched
// at run time is data/trophies.json.
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const GUIDE_OPEN_KEY = 'gta6-trophy-guide-open-v1';
const PHASES = [
  { n: 1, title: 'Story', note: 'Play the five chapters straight through, taking contact and stranger strands as they appear. Chapter and mission trophies pop as you go; nothing here can be missed.', hours: '60–80 h' },
  { n: 2, title: 'Open world', note: 'After the credits: collectibles, exploration, activities, challenges and robberies across Leonida. The longest phase — most of the platinum lives here.', hours: '≈ 100 h' },
  { n: 3, title: 'Cleanup', note: 'Money, garages and the 100% checklist. A Long Road is the last gold; the platinum pops with it.', hours: '≈ 10 h' },
];
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const phaseEl = document.getElementById('phaseFilter');
const gradeEl = document.getElementById('gradeFilter');
const sortEl = document.getElementById('sortSelect');
const unearnedEl = document.getElementById('unearnedOnly');
const spoilerEl = document.getElementById('spoilerToggle');

let allTrophies = [];
let earned = new Set(loadStoredProgress());
let openGuides = new Set(loadStoredOpenGuides());

function loadStoredProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function loadStoredOpenGuides() {
  try { return JSON.parse(localStorage.getItem(GUIDE_OPEN_KEY) ?? '[]'); } catch { return []; }
}
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}
function saveOpenGuides() {
  localStorage.setItem(GUIDE_OPEN_KEY, JSON.stringify([...openGuides]));
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

// Fastest-to-platinum route: phase order first, then easiest, then quickest.
function routeRank(trophy) {
  return (trophy.phase - 1) * 10000 + trophy.difficulty * 100 + trophy.hours;
}
function sortTrophies(trophies) {
  const sorted = [...trophies];
  if (sortEl.value === 'easiest') {
    sorted.sort((a, b) => a.difficulty - b.difficulty || a.hours - b.hours || a.phase - b.phase || a.id - b.id);
  } else if (sortEl.value === 'fastest') {
    sorted.sort((a, b) => routeRank(a) - routeRank(b) || a.id - b.id);
  } else if (sortEl.value === 'hardest') {
    sorted.sort((a, b) => b.difficulty - a.difficulty || b.hours - a.hours || a.id - b.id);
  } else {
    sorted.sort((a, b) => a.id - b.id);
  }
  return sorted;
}

function buildPhaseCards() {
  const wrap = document.getElementById('phaseCards');
  for (const phase of PHASES) {
    const mine = allTrophies.filter((t) => t.phase === phase.n);
    const done = mine.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'phaseCard';
    const head = document.createElement('h3');
    head.textContent = `Phase ${phase.n}: ${phase.title} `;
    const meta = document.createElement('span');
    meta.className = 'stageCount';
    meta.textContent = `(${mine.length} trophies · ${done} earned · ${phase.hours})`;
    head.append(meta);
    const note = document.createElement('p');
    note.className = 'sectionNote';
    note.textContent = phase.note;
    const namesEl = document.createElement('div');
    namesEl.className = 'stageTrophies';
    const shownNames = mine.map((t) => t.name);
    namesEl.textContent = shownNames.slice(0, 10).join(' · ') + (shownNames.length > 10 ? ` · …and ${shownNames.length - 10} more — click to filter` : '');
    card.append(head, note, namesEl);
    card.addEventListener('click', () => {
      phaseEl.value = String(phase.n);
      kindEl.value = 'all';
      searchEl.value = '';
      renderTrophyList();
      document.getElementById('controls').scrollIntoView();
    });
    wrap.append(card);
  }
}

function buildMissablePanel() {
  const missable = allTrophies.filter((t) => t.missable);
  const text = document.getElementById('missableText');
  if (missable.length === 0) {
    text.textContent = 'No trophy is confirmed missable.';
    return;
  }
  text.textContent = missable.map((t) => `${t.name} — meditate at Jason's house before Chapter 1 ends; the other 17 spots stay available.`).join(' ');
}

function spoilerHides(trophy) {
  return spoilerEl.checked && trophy.hidden && !earned.has(trophy.name);
}

function trophyMatchesFilters(trophy) {
  if (kindEl.value === 'missable' && !trophy.missable) return false;
  if (kindEl.value === 'online') return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && kindEl.value !== 'online' && trophy.kind !== kindEl.value) return false;
  if (phaseEl.value !== 'all' && trophy.phase !== Number(phaseEl.value)) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (unearnedEl.checked && earned.has(trophy.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q) || trophy.guide.toLowerCase().includes(q))) return false;
  return true;
}

function makeBadge(text, cls) {
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

function difficultyStars(difficulty) {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
}

function renderTrophyCard(trophy, routeIndex) {
  const card = document.createElement('article');
  card.className = 'trophy';
  if (earned.has(trophy.name)) card.classList.add('earned');
  if (trophy.missable) card.classList.add('missableCard');

  const head = document.createElement('div');
  head.className = 'trophyHead';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => toggleTrophyEarned(trophy, box.checked));
  const nameWrap = document.createElement('div');
  const nameEl = document.createElement('div');
  nameEl.className = 'trophyName';
  const descEl = document.createElement('p');
  descEl.className = 'trophyDesc';
  if (spoilerHides(trophy)) {
    nameEl.textContent = 'Hidden story trophy — earn it to reveal';
    nameEl.classList.add('spoilerMask');
    descEl.textContent = 'Hidden on PlayStation until earned. Untick spoiler-safe above, or tick it earned, to see it.';
  } else {
    nameEl.textContent = trophy.name;
    descEl.textContent = trophy.description;
  }
  nameWrap.append(nameEl, descEl);
  head.append(box, nameWrap);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badgeRow';
  badges.append(makeBadge(trophy.grade, trophy.grade));
  badges.append(makeBadge(trophy.kind, 'kind'));
  badges.append(makeBadge(`Phase ${trophy.phase}`, 'phase'));
  badges.append(makeBadge(`${difficultyStars(trophy.difficulty)} ${trophy.difficulty}/5`, 'difficulty'));
  badges.append(makeBadge(trophy.timeLabel, 'time'));
  if (sortEl.value === 'fastest' && routeIndex !== undefined) {
    badges.append(makeBadge(`Route #${routeIndex + 1}`, 'route'));
  }
  if (trophy.hidden) badges.append(makeBadge('Hidden', 'hiddenTag'));
  if (trophy.missable) badges.append(makeBadge('Missable', 'missable'));
  card.append(badges);

  const guideBtn = document.createElement('button');
  guideBtn.type = 'button';
  guideBtn.className = 'guideBtn';
  guideBtn.textContent = openGuides.has(trophy.name) ? 'Hide guide ▲' : 'Show guide ▼';
  guideBtn.addEventListener('click', () => toggleTrophyGuide(trophy, guideBtn, card));
  card.append(guideBtn);

  if (openGuides.has(trophy.name)) appendGuideBox(trophy, card);
  return card;
}

function appendGuideBox(trophy, card) {
  const box = document.createElement('div');
  box.className = 'guideBox';
  const guide = document.createElement('p');
  guide.textContent = trophy.guide.split(' Source: ')[0] + '.';
  const source = document.createElement('p');
  source.className = 'source';
  source.textContent = 'Source: ' + (trophy.guide.split(' Source: ')[1] ?? 'Official trophy list via Exophase / PSNProfiles.');
  const miss = document.createElement('div');
  miss.className = trophy.missable ? 'missableDetail warn' : 'missableDetail safe';
  const missHead = document.createElement('strong');
  missHead.textContent = trophy.missable ? '⚠ Missable check — POSSIBLY MISSABLE' : '✓ Missable check — safe';
  const missBody = document.createElement('p');
  missBody.textContent = trophy.missableDetail ?? 'Not missable.';
  miss.append(missHead, missBody);
  box.append(guide, source, miss);
  card.append(box);
}

function toggleTrophyGuide(trophy, button, card) {
  if (openGuides.has(trophy.name)) {
    openGuides.delete(trophy.name);
    card.querySelector('.guideBox')?.remove();
    button.textContent = 'Show guide ▼';
  } else {
    openGuides.add(trophy.name);
    appendGuideBox(trophy, card);
    button.textContent = 'Hide guide ▲';
  }
  saveOpenGuides();
}

function renderTrophyList() {
  listEl.replaceChildren();
  const shown = sortTrophies(allTrophies.filter(trophyMatchesFilters));
  shown.forEach((trophy, i) => listEl.append(renderTrophyCard(trophy, sortEl.value === 'fastest' ? i : undefined)));
  document.getElementById('emptyNote').hidden = shown.length !== 0;
  updateProgressBar();
  updateDashboard();
}

function updateProgressBar() {
  const total = allTrophies.length;
  const done = earned.size;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressFill').style.width = total ? `${(done / total) * 100}%` : '0%';
  const byGrade = (g) => allTrophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  const totalByGrade = (g) => allTrophies.filter((t) => t.grade === g).length;
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade('platinum')}/${totalByGrade('platinum')} · Gold ${byGrade('gold')}/${totalByGrade('gold')} · Silver ${byGrade('silver')}/${totalByGrade('silver')} · Bronze ${byGrade('bronze')}/${totalByGrade('bronze')}`;
}

function updateDashboard() {
  const total = allTrophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('dashPercent').textContent = `${pct}%`;
  document.getElementById('dashCount').textContent = `${done} / ${total} trophies`;
  document.getElementById('dashFill').style.width = `${pct}%`;
  document.getElementById('dashHours').textContent =
    `≈ 200 h to the platinum (PowerPyx, difficulty 4/10) · ${done} earned, ${total - done} to go`;

  const bars = document.getElementById('gradeBars');
  bars.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const mine = allTrophies.filter((t) => t.grade === grade);
    const got = mine.filter((t) => earned.has(t.name)).length;
    const row = document.createElement('div');
    row.className = 'gradeRow';
    const label = document.createElement('span');
    label.className = 'gradeLabel';
    label.textContent = `${GRADE_LABEL[grade]} ${got}/${mine.length}`;
    const bar = document.createElement('div');
    bar.className = 'gradeBar';
    const fill = document.createElement('div');
    fill.className = `gradeFill ${grade}`;
    fill.style.width = mine.length ? `${(got / mine.length) * 100}%` : '0%';
    bar.append(fill);
    row.append(label, bar);
    bars.append(row);
  }

  const next = document.getElementById('nextFive');
  next.replaceChildren();
  const easiest = sortTrophies(allTrophies.filter((t) => !earned.has(t.name) && t.id !== 1))
    .sort((a, b) => a.difficulty - b.difficulty || a.hours - b.hours || a.phase - b.phase)
    .slice(0, 5);
  if (easiest.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'All 55 earned — Leonida Legend!';
    next.append(li);
  }
  for (const t of easiest) {
    const li = document.createElement('li');
    li.textContent = `${t.name} — ${difficultyStars(t.difficulty)} · ${t.timeLabel} · Phase ${t.phase}`;
    next.append(li);
  }
}

function toggleTrophyEarned(trophy, isEarned) {
  if (isEarned) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveProgress();
  renderTrophyList();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'gta6-trophy-guide', version: 2, earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const known = new Set(allTrophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveProgress();
    renderTrophyList();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
}

function resetProgress() {
  if (!confirm('Clear all earned ticks?')) return;
  earned = new Set();
  saveProgress();
  renderTrophyList();
}

function bindControls() {
  searchEl.addEventListener('input', renderTrophyList);
  kindEl.addEventListener('change', renderTrophyList);
  phaseEl.addEventListener('change', renderTrophyList);
  gradeEl.addEventListener('change', renderTrophyList);
  sortEl.addEventListener('change', renderTrophyList);
  unearnedEl.addEventListener('change', renderTrophyList);
  spoilerEl.addEventListener('change', renderTrophyList);
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => importProgress(e.target.files[0]));
  document.getElementById('resetBtn').addEventListener('click', resetProgress);
}

async function initTrophyGuide() {
  allTrophies = await loadTrophies();
  buildPhaseCards();
  buildMissablePanel();
  bindControls();
  renderTrophyList();
}

initTrophyGuide();
