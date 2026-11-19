// GTA VI trophy guide + tracker: checklist saved in the browser, filters,
// spoiler-safe story trophies, export/import, and a 5-stage platinum roadmap.
// Static only: the only file fetched at run time is data/trophies.json.
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const GUIDE_OPEN_KEY = 'gta6-trophy-guide-open-v1';
const ROADMAP_STAGES = [
  { n: 1, title: 'Story first — Chapters 1–4 and the finale', note: 'Play the story straight through. Chapter and mission trophies pop as you go; nothing here can be missed.' },
  { n: 2, title: 'Stranger strands and contacts', note: 'Andy, Kenton, Billy, Randy, Tyrone, Bret, and 8 stranger strands. Finish each strand to its final mission.' },
  { n: 3, title: 'Collectibles and exploration', note: 'Cards, WAiNK spots, vehicles, meditation spots, and the full map of Leonida. Do the Chapter 1 meditation spot early — it may be missable.' },
  { n: 4, title: 'Activities and challenges', note: 'Shooting range gold, stunts, races, fishing, the arcade, heists and robberies, and 50 challenges.' },
  { n: 5, title: 'Cleanup and the platinum', note: 'Money, garages, and the 100% completion checklist. A Long Road is the last gold; the platinum pops with it.' },
];

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
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

function buildRoadmap() {
  const ol = document.getElementById('roadmapStages');
  for (const stage of ROADMAP_STAGES) {
    const names = allTrophies.filter((t) => t.stage === stage.n).map((t) => t.name);
    const li = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = `Stage ${stage.n}: ${stage.title} `;
    const count = document.createElement('span');
    count.className = 'stageCount';
    count.textContent = `(${names.length} trophies)`;
    const note = document.createElement('div');
    note.textContent = stage.note;
    const namesEl = document.createElement('div');
    namesEl.className = 'stageTrophies';
    namesEl.textContent = names.join(' · ');
    li.append(title, count, note, namesEl);
    li.addEventListener('click', () => {
      kindEl.value = 'all';
      searchEl.value = '';
      renderTrophyList();
      document.getElementById('trophyList').scrollIntoView();
    });
    ol.append(li);
  }
}

function buildMissablePanel() {
  const missable = allTrophies.filter((t) => t.missable);
  const text = document.getElementById('missableText');
  if (missable.length === 0) {
    text.textContent = 'No trophy is confirmed missable.';
    return;
  }
  text.textContent = missable.map((t) => `${t.name} — ${t.guide.split('. ')[0]}.`).join(' ');
}

function spoilerHides(trophy) {
  return spoilerEl.checked && trophy.hidden && !earned.has(trophy.name);
}

function trophyMatchesFilters(trophy) {
  if (kindEl.value === 'missable' && !trophy.missable) return false;
  if (kindEl.value === 'online') return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && kindEl.value !== 'online' && trophy.kind !== kindEl.value) return false;
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

function renderTrophyCard(trophy) {
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
  box.append(guide, source);
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
  const shown = allTrophies.filter(trophyMatchesFilters);
  for (const trophy of shown) listEl.append(renderTrophyCard(trophy));
  document.getElementById('emptyNote').hidden = shown.length !== 0;
  updateProgressBar();
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

function toggleTrophyEarned(trophy, isEarned) {
  if (isEarned) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveProgress();
  renderTrophyList();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'gta6-trophy-guide', earned: [...earned] }, null, 2)], { type: 'application/json' });
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
  gradeEl.addEventListener('change', renderTrophyList);
  unearnedEl.addEventListener('change', renderTrophyList);
  spoilerEl.addEventListener('change', renderTrophyList);
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => importProgress(e.target.files[0]));
  document.getElementById('resetBtn').addEventListener('click', resetProgress);
}

async function initTrophyGuide() {
  allTrophies = await loadTrophies();
  buildRoadmap();
  buildMissablePanel();
  bindControls();
  renderTrophyList();
}

initTrophyGuide();
