const STORAGE_KEY = "runquest.daily-training.v1";
const LEGACY_KEY = "runquest.player.v1";
const RANKS = [
  { name: "E", xpToAdvance: 100, steps: 5000, pushups: 15, situps: 15, squats: 25, accent: "#a6afc2" },
  { name: "D", xpToAdvance: 120, steps: 7000, pushups: 25, situps: 25, squats: 50, accent: "#71d9fa" },
  { name: "C", xpToAdvance: 140, steps: 9000, pushups: 45, situps: 45, squats: 75, accent: "#7ea9ff" },
  { name: "B", xpToAdvance: 160, steps: 11000, pushups: 60, situps: 60, squats: 100, accent: "#ae8cff" },
  { name: "A", xpToAdvance: 180, steps: 12500, pushups: 80, situps: 80, squats: 125, accent: "#ff91ce" },
  { name: "S", xpToAdvance: 220, steps: 15000, pushups: 100, situps: 100, squats: 150, accent: "#ffce76" },
];
const QUESTS = [
  { id: "steps", title: "Langkah kaki", icon: "↗", unit: "LANGKAH", target: (rank) => rank.steps, description: "Jalan kaki sepanjang hari. Hitungan perangkat, dicentang sendiri." },
  { id: "pushups", title: "Push-up", icon: "↑", unit: "REPETISI", target: (rank) => rank.pushups, description: "Bisa dicicil beberapa set sampai target hari ini selesai." },
  { id: "situps", title: "Sit-up", icon: "⌁", unit: "REPETISI", target: (rank) => rank.situps, description: "Bisa dicicil beberapa set sampai target hari ini selesai." },
  { id: "squats", title: "Squat", icon: "↓", unit: "REPETISI", target: (rank) => rank.squats, description: "Bisa dicicil beberapa set sampai target hari ini selesai." },
];
const $ = (id) => document.getElementById(id);
const dayKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function blankPlayer() {
  return { dailyQuests: {} };
}

function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankPlayer();
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !saved.dailyQuests || typeof saved.dailyQuests !== "object" || Array.isArray(saved.dailyQuests)) {
      throw new Error("Saved daily quest data is invalid.");
    }
    const dailyQuests = {};
    for (const [date, ids] of Object.entries(saved.dailyQuests)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(ids)) continue;
      dailyQuests[date] = [...new Set(ids.filter((id) => QUESTS.some((quest) => quest.id === id)))];
    }
    return { dailyQuests };
  } catch (error) {
    console.error("SoloLevelUp could not load saved daily quests.", error);
    showToast("Data quest lama nggak bisa dibaca. Checklist baru dimulai di browser ini.");
    return blankPlayer();
  }
}

let player = loadPlayer();
let previewRank = null;
let toastId = null;
let legacyProgressNotice = false;
try {
  legacyProgressNotice = !localStorage.getItem(STORAGE_KEY) && Boolean(localStorage.getItem(LEGACY_KEY));
} catch (error) {
  console.error("SoloLevelUp could not check for previous progress.", error);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    return true;
  } catch (error) {
    console.error("SoloLevelUp could not save daily quests.", error);
    showToast("Progress nggak bisa disimpan. Cek ruang penyimpanan browser.");
    return false;
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastId);
  toastId = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

function totalXp() {
  return Object.values(player.dailyQuests).reduce((sum, completed) => sum + completed.length, 0);
}

function progressForXp(xp) {
  let remaining = xp;
  for (const rank of RANKS) {
    if (remaining < rank.xpToAdvance) {
      return {
        rank,
        xpIntoRank: remaining,
        xpToAdvance: rank.xpToAdvance,
        remainingXp: rank.xpToAdvance - remaining,
        star: 0,
      };
    }
    remaining -= rank.xpToAdvance;
  }
  const star = Math.floor(remaining / RANKS.at(-1).xpToAdvance) + 1;
  const xpIntoRank = remaining % RANKS.at(-1).xpToAdvance;
  return {
    rank: RANKS.at(-1),
    xpIntoRank,
    xpToAdvance: RANKS.at(-1).xpToAdvance,
    remainingXp: RANKS.at(-1).xpToAdvance - xpIntoRank,
    star,
  };
}

function rankByName(name) {
  return RANKS.find((rank) => rank.name === name) ?? RANKS.at(-1);
}

function rankDisplay(progress) {
  return progress.star ? "S+" : progress.rank.name;
}

function xpTargetLabel(progress) {
  if (progress.star) return `S+ ★ ${progress.star + 1}`;
  if (progress.rank.name === "S") return "S+ ★ 1";
  return `${RANKS[RANKS.indexOf(progress.rank) + 1].name}-RANK`;
}

function completedToday() {
  return player.dailyQuests[dayKey()] ?? [];
}

function activeDayCount() {
  return Object.values(player.dailyQuests).filter((completed) => completed.length > 0).length;
}

function trainingStreak() {
  const days = Object.entries(player.dailyQuests)
    .filter(([, completed]) => completed.length > 0)
    .map(([date]) => date);
  const set = new Set(days);
  const cursor = new Date();
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderRankPath(actualProgress, selectedRank) {
  const currentRank = actualProgress.star ? "S+" : actualProgress.rank.name;
  document.querySelectorAll("[data-rank-step]").forEach((step) => {
    const name = step.dataset.rankStep;
    const isSelected = name === selectedRank;
    const isCurrent = name === currentRank;
    const unlocked = name === "S+"
      ? actualProgress.star > 0
      : RANKS.findIndex((rank) => rank.name === name) <= RANKS.findIndex((rank) => rank.name === actualProgress.rank.name);
    step.classList.toggle("unlocked", unlocked);
    step.classList.toggle("current", isCurrent && !previewRank);
    step.classList.toggle("preview", isSelected && Boolean(previewRank));
    step.querySelector("button").setAttribute("aria-pressed", String(isSelected));
    if (isCurrent) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
  $("rank-rule-caption").textContent = "ONE RANK · ONE XP BAR · S+ STARS";
}

function renderPlayerStatus(xp) {
  const actual = progressForXp(xp);
  const currentRank = actual.star ? "S+" : actual.rank.name;
  const selectedName = previewRank ?? currentRank;
  const previewing = Boolean(previewRank);
  const selectedBaseRank = rankByName(selectedName);
  const preview = previewing
    ? {
        rank: selectedBaseRank,
        xpIntoRank: Math.round(selectedBaseRank.xpToAdvance * 0.65),
        xpToAdvance: selectedName === "S+" ? 220 : selectedBaseRank.xpToAdvance,
        remainingXp: (selectedName === "S+" ? 220 : selectedBaseRank.xpToAdvance) - Math.round(selectedBaseRank.xpToAdvance * 0.65),
        star: selectedName === "S+" ? 1 : 0,
      }
    : actual;
  const displayRank = rankDisplay(preview);
  $("header-rank").textContent = `${currentRank}-RANK`;
  $("rank-name").textContent = `${displayRank}-RANK HUNTER`;
  const portrait = $("hunter-portrait");
  $("hero-portrait-slot").append(portrait);
  portrait.hidden = false;
  portrait.dataset.rank = displayRank;
  portrait.setAttribute(
    "aria-label",
    preview.star
      ? `Potret hunter orisinal rank S+ bintang ${preview.star}`
      : `Potret hunter orisinal rank ${displayRank}`,
  );
  $("rank-letter").textContent = displayRank;
  $("portrait-rank").textContent = displayRank;
  $("level-number").textContent = `${preview.xpIntoRank} / ${preview.xpToAdvance}`;
  $("rank-sublevel").textContent = preview.star
    ? ` · STAR ${preview.star} · ${preview.remainingXp} XP TO STAR ${preview.star + 1}`
    : ` · ${preview.remainingXp} XP TO ${xpTargetLabel(preview)}`;
  $("level-label").textContent = preview.star ? `S+ STAR ${preview.star} XP` : "RANK XP";
  $("player-status-tag").innerHTML = previewing ? "<i></i> PREVIEW" : "<i></i> ACTIVE";
  $("rank-preview-note").hidden = !previewing;
  $("rank-preview-note").querySelector("span").textContent = previewing
    ? `PREVIEW · ${selectedBaseRank.xpToAdvance} XP UNTUK RANK BERIKUTNYA · XP ASLI TETAP AMAN.`
    : "";
  const panel = document.querySelector(".level-panel");
  panel.dataset.rank = displayRank === "S+" ? "S+" : preview.rank.name;
  const progressBar = $("xp-progress").parentElement;
  progressBar.setAttribute("aria-valuemax", String(preview.xpToAdvance));
  progressBar.setAttribute("aria-valuenow", String(preview.xpIntoRank));
  $("xp-current").textContent = `${preview.xpIntoRank} / ${preview.xpToAdvance} XP`;
  $("xp-next").textContent = `${preview.remainingXp} XP TO ${xpTargetLabel(preview)}`;
  $("xp-progress").style.width = `${preview.xpIntoRank / preview.xpToAdvance * 100}%`;
  renderRankPath(actual, selectedName);
  $("total-xp").textContent = xp.toLocaleString("id-ID");
  $("total-quests").textContent = xp.toLocaleString("id-ID");
  $("total-days").textContent = `${activeDayCount()} TRAINING DAYS`;
}

function renderDailyQuests(rank, completed, previewing) {
  const list = $("mission-list");
  list.replaceChildren();
  QUESTS.forEach((quest, index) => {
    const done = completed.includes(quest.id);
    const target = quest.target(rank);
    const row = document.createElement("article");
    row.className = `system-quest-row${done ? " completed" : ""}`;
    row.setAttribute("role", "listitem");
    const icon = document.createElement("span");
    icon.className = "system-quest-icon";
    icon.textContent = done ? "✓" : quest.icon;
    icon.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    copy.className = "system-quest-copy";
    const indexLabel = document.createElement("span");
    indexLabel.className = "system-quest-index";
    indexLabel.textContent = `OBJECTIVE 0${index + 1}`;
    const title = document.createElement("h3");
    title.textContent = quest.title;
    const description = document.createElement("p");
    description.textContent = quest.description;
    const targetBlock = document.createElement("div");
    targetBlock.className = "system-quest-target";
    const targetLabel = document.createElement("strong");
    targetLabel.textContent = target.toLocaleString("id-ID");
    const unit = document.createElement("span");
    unit.textContent = quest.unit;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "system-quest-action";
    button.setAttribute("aria-pressed", String(done));
    button.disabled = previewing;
    button.textContent = previewing ? "PREVIEW" : done ? "✓ DONE" : "MARK DONE";
    const reward = document.createElement("span");
    reward.className = "system-quest-reward";
    reward.textContent = done ? "XP CLAIMED" : "+1 XP";
    button.addEventListener("click", () => toggleQuest(quest.id));
    copy.append(indexLabel, title, description);
    targetBlock.append(targetLabel, unit);
    row.append(icon, copy, targetBlock, reward, button);
    list.append(row);
  });
}

function renderHistory() {
  const list = $("history-list");
  list.replaceChildren();
  const days = Object.entries(player.dailyQuests)
    .filter(([, completed]) => completed.length > 0)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14);
  $("empty-history").hidden = days.length > 0;
  for (const [date, completed] of days) {
    const row = document.createElement("div");
    row.className = "history-row";
    const dateCell = document.createElement("span");
    dateCell.className = "activity-name";
    dateCell.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
    const questCell = document.createElement("span");
    questCell.textContent = `${completed.length} / 4 quest`;
    const xpCell = document.createElement("span");
    xpCell.className = "activity-xp";
    xpCell.textContent = `+${completed.length} XP`;
    row.append(dateCell, questCell, xpCell);
    list.append(row);
  }
}

function renderDashboard() {
  const xp = totalXp();
  const progress = progressForXp(xp);
  const actualRank = progress.star ? RANKS.at(-1) : progress.rank;
  const questRank = previewRank ? rankByName(previewRank) : actualRank;
  const questRankLabel = previewRank ?? (progress.star ? "S+" : actualRank.name);
  const today = completedToday();
  const todayDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  $("today-label").textContent = todayDate.toUpperCase();
  $("streak-value").innerHTML = `${trainingStreak()} <small>HARI</small>`;
  $("today-rank").textContent = `${progress.star ? "S+" : actualRank.name}-RANK`;
  $("today-completed").textContent = today.length;
  $("today-xp").textContent = today.length;
  $("today-progress").style.width = `${today.length / QUESTS.length * 100}%`;
  $("quest-panel-date").textContent = `${todayDate.toUpperCase()} · ${questRankLabel}-RANK`;
  $("available-xp").textContent = String(QUESTS.length - today.length);
  $("system-progress-label").innerHTML = `QUESTS COMPLETED <strong>${today.length} / ${QUESTS.length}</strong>`;
  $("system-progress-percent").textContent = `${Math.round(today.length / QUESTS.length * 100)}%`;
  $("system-progress-bar").style.width = `${today.length / QUESTS.length * 100}%`;
  $("daily-reset-label").textContent = previewRank
    ? `PREVIEW TARGET · ${previewRank}-RANK`
    : `${today.length} / 4 DONE · +${QUESTS.length - today.length} XP AVAILABLE`;
  renderPlayerStatus(xp);
  renderDailyQuests(questRank, today, Boolean(previewRank));
  renderHistory();
}

function notifyProgress(previousXp, gainedXp, wasDone) {
  const previous = progressForXp(previousXp);
  const current = progressForXp(totalXp());
  if (!wasDone && current.star > previous.star) {
    showToast(`STAR UP! S+ ★${current.star} · +${gainedXp} XP`);
  } else if (!wasDone && (current.star ? "S+" : current.rank.name) !== (previous.star ? "S+" : previous.rank.name)) {
    showToast(`RANK UP! ${current.star ? "S+" : current.rank.name}-RANK HUNTER · +${gainedXp} XP`);
  } else if (wasDone) {
    showToast(`Quest dibatalkan. −${gainedXp} XP`);
  } else {
    showToast(`Quest complete! +${gainedXp} XP`);
  }
}

function toggleQuest(id) {
  if (!QUESTS.some((quest) => quest.id === id)) return;
  const today = dayKey();
  const previousXp = totalXp();
  const completed = completedToday();
  const wasDone = completed.includes(id);
  player.dailyQuests[today] = wasDone ? completed.filter((questId) => questId !== id) : [...completed, id];
  if (!player.dailyQuests[today].length) delete player.dailyQuests[today];
  if (!persist()) {
    player.dailyQuests[today] = completed;
    if (!completed.length) delete player.dailyQuests[today];
    return;
  }
  renderDashboard();
  notifyProgress(previousXp, 1, wasDone);
}

function renderRankPreview() {
  $("rank-ladder").addEventListener("click", (event) => {
    const button = event.target.closest("button[aria-label^='Preview ']");
    if (!button) return;
    const selected = button.getAttribute("aria-label") === "Preview S-Rank star"
      ? "S+"
      : button.getAttribute("aria-label").match(/^Preview ([A-S])-Rank$/)?.[1];
    if (!selected) return;
    previewRank = selected;
    renderDashboard();
  });
  $("exit-rank-preview").addEventListener("click", () => {
    previewRank = null;
    renderDashboard();
  });
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item === link));
  });
});

renderRankPreview();
renderDashboard();
if (legacyProgressNotice) {
  showToast("Daily quest baru aktif. XP latihan lama tetap aman, tapi progres quest dimulai dari 0.");
}
