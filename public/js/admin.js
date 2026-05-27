const BASE = "/api";
let token = localStorage.getItem("adminToken");
let charts = {};

Chart.defaults.color = "#6b6b8a";
Chart.defaults.borderColor = "#1e1e30";
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";

window.onload = () => { if (token) showPanel(); };

// ── AUTH ──
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errEl = document.getElementById("login-error");
  errEl.textContent = "";

  try {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return (errEl.textContent = data.error || "Login failed");

    token = data.token;
    localStorage.setItem("adminToken", token);

    const check = await fetch(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    if (check.status === 403) {
      localStorage.removeItem("adminToken"); token = null;
      return (errEl.textContent = "Not an admin account");
    }
    showPanel();
  } catch { errEl.textContent = "Connection error"; }
}

function logout() {
  localStorage.removeItem("adminToken"); token = null;
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
}

function showPanel() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  loadDashboard();
  loadUsers();
  loadChallenges();
}

// ── TABS ──
function switchTab(name) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.add("active");
  event.currentTarget.classList.add("active");
}

// ── DASHBOARD ──
async function loadDashboard() {
  try {
    const res = await fetch(`${BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const d = await res.json();

    animateCount("k-users", d.totalUsers);
    animateCount("k-challenges", d.totalChallenges);
    animateCount("k-completions", d.totalCompletions);
    animateCount("k-points", d.totalPoints);
    animateCount("k-clues", d.totalClues);
    animateCount("k-accusations", d.totalAccusations);
    animateCount("k-solved", d.solvedCase);

    renderTopUsers(d.topUsers || []);
    renderChallengeChart(d.challengeCompletions || []);
    renderSuspectChart(d.suspectAccusations || []);
    renderEndingChart(d.endingDistribution || []);
  } catch (e) { console.error(e); }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  const n = parseInt(target) || 0;
  let current = 0;
  const step = Math.max(1, Math.floor(n / 30));
  const timer = setInterval(() => {
    current = Math.min(current + step, n);
    el.textContent = current.toLocaleString();
    if (current >= n) clearInterval(timer);
  }, 30);
}

function renderTopUsers(users) {
  const labels = users.map(u => u.username);
  const data = users.map(u => u.points);
  const colors = ["#fbbf24","#d1d5db","#fca5a5","#a78bfa","#67e8f9","#34d399","#f9a8d4","#86efac","#93c5fd","#c4b5fd"];

  if (charts["users"]) charts["users"].destroy();
  charts["users"] = new Chart(document.getElementById("chart-users"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors.slice(0, data.length), borderRadius: 6, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#1e1e30" }, beginAtZero: true }
      }
    }
  });
}

function renderChallengeChart(challenges) {
  const labels = challenges.map(c => truncate(c.description, 28));
  const data = challenges.map(c => c.completions);

  if (charts["challenges"]) charts["challenges"].destroy();
  charts["challenges"] = new Chart(document.getElementById("chart-challenges"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data, backgroundColor: "#06b6d455", borderColor: "#06b6d4", borderWidth: 1, borderRadius: 6, borderSkipped: false }]
    },
    options: {
      indexAxis: "y",
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#1e1e30" }, beginAtZero: true, ticks: { stepSize: 1 } },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderSuspectChart(suspects) {
  const labels = suspects.map(s => s.name);
  const data = suspects.map(s => s.accusations);
  const colors = ["#f87171","#fb923c","#fbbf24","#34d399","#67e8f9"];

  if (charts["suspects"]) charts["suspects"].destroy();
  charts["suspects"] = new Chart(document.getElementById("chart-suspects"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: "#14141f", hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "right", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } },
      cutout: "62%"
    }
  });
}

function renderEndingChart(endings) {
  const labels = endings.map(e => truncate(e.title, 20));
  const data = endings.map(e => e.obtained);
  const colors = endings.map(e => e.is_true_culprit ? "#34d399" : "#f87171");
  const borders = endings.map(e => e.is_true_culprit ? "#059669" : "#dc2626");

  if (charts["endings"]) charts["endings"].destroy();
  charts["endings"] = new Chart(document.getElementById("chart-endings"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderColor: borders, borderWidth: 1, borderRadius: 6, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => endings[ctx.dataIndex].is_true_culprit ? "✓ True culprit" : "✗ Wrong ending"
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#1e1e30" }, beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

// ── USERS TABLE ──
async function loadUsers() {
  const tbody = document.getElementById("users-tbody");
  try {
    const res = await fetch(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) return logout();
    const users = await res.json();
    document.getElementById("user-count").textContent = `${users.length} users`;

    if (!users.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty">No users found</td></tr>`; return; }

    tbody.innerHTML = users.map((u, i) => `
      <tr id="user-row-${u.user_id}">
        <td><span class="rank ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n'}">${i+1}</span></td>
        <td>
          ${u.username}
          ${u.user_id === 1 ? '<span class="badge admin">Admin</span>' : ''}
        </td>
        <td style="color:var(--muted)">${u.email}</td>
        <td><span class="pts">${Number(u.points).toLocaleString()}</span></td>
        <td style="color:var(--muted)">${u.created_on ? u.created_on.substring(0,10) : '—'}</td>
        <td>${u.user_id === 1
          ? `<button class="delete-btn" disabled>Protected</button>`
          : `<button class="delete-btn" onclick="deleteUser(${u.user_id}, '${u.username}')">Delete</button>`
        }</td>
      </tr>`).join("");
  } catch { tbody.innerHTML = `<tr><td colspan="6" class="empty">Failed to load</td></tr>`; }
}

// ── CHALLENGES TABLE ──
async function loadChallenges() {
  const tbody = document.getElementById("challenges-tbody");
  try {
    const res = await fetch(`${BASE}/admin/challenges`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) return logout();
    const challenges = await res.json();
    document.getElementById("challenge-count").textContent = `${challenges.length} challenges`;

    if (!challenges.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty">No challenges found</td></tr>`; return; }

    tbody.innerHTML = challenges.map(c => `
      <tr id="challenge-row-${c.challenge_id}">
        <td style="color:var(--muted)">${c.challenge_id}</td>
        <td>${c.description}</td>
        <td><span class="pts">+${c.points} pts</span></td>
        <td><button class="delete-btn" onclick="deleteChallenge(${c.challenge_id})">Delete</button></td>
      </tr>`).join("");
  } catch { tbody.innerHTML = `<tr><td colspan="4" class="empty">Failed to load</td></tr>`; }
}

// ── DELETE ──
async function deleteUser(user_id, username) {
  if (!confirm(`Delete "${username}"? All their data will be removed permanently.`)) return;
  const res = await fetch(`${BASE}/admin/users/${user_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (res.ok) {
    document.getElementById(`user-row-${user_id}`)?.remove();
    showToast(`User "${username}" deleted`);
    loadDashboard();
  } else {
    const d = await res.json();
    showToast(d.error || "Delete failed", true);
  }
}

async function deleteChallenge(challenge_id) {
  if (!confirm(`Delete challenge #${challenge_id}? This cannot be undone.`)) return;
  const res = await fetch(`${BASE}/admin/challenges/${challenge_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (res.ok) {
    document.getElementById(`challenge-row-${challenge_id}`)?.remove();
    showToast(`Challenge #${challenge_id} deleted`);
    loadDashboard();
  } else {
    const d = await res.json();
    showToast(d.error || "Delete failed", true);
  }
}

// ── UTILS ──
function truncate(str, n) { return str.length > n ? str.substring(0, n) + "…" : str; }

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = isError ? "error" : "success";
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 3000);
}
