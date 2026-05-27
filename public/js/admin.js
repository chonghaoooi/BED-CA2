const BASE = "/api";
let token = localStorage.getItem("adminToken");

// On load: if token exists try loading panel
window.onload = () => {
  if (token) showPanel();
};

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

    // Verify admin access
    const check = await fetch(`${BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (check.status === 403) {
      localStorage.removeItem("adminToken");
      token = null;
      return (errEl.textContent = "Not an admin account");
    }

    showPanel();
  } catch (e) {
    errEl.textContent = "Connection error";
  }
}

function logout() {
  localStorage.removeItem("adminToken");
  token = null;
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
}

function showPanel() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  loadUsers();
  loadChallenges();
}

async function loadUsers() {
  const tbody = document.getElementById("users-tbody");
  try {
    const res = await fetch(`${BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) return logout();
    const users = await res.json();

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="loading">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr id="user-row-${u.user_id}">
        <td>${u.user_id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.points}</td>
        <td>${u.created_on ? u.created_on.substring(0, 10) : "-"}</td>
        <td>
          ${u.user_id === 1
            ? `<button class="delete-btn" disabled>Admin</button>`
            : `<button class="delete-btn" onclick="deleteUser(${u.user_id}, '${u.username}')">Delete</button>`
          }
        </td>
      </tr>
    `).join("");
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="loading">Failed to load users</td></tr>`;
  }
}

async function loadChallenges() {
  const tbody = document.getElementById("challenges-tbody");
  try {
    const res = await fetch(`${BASE}/admin/challenges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) return logout();
    const challenges = await res.json();

    if (!challenges.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="loading">No challenges found</td></tr>`;
      return;
    }

    tbody.innerHTML = challenges.map(c => `
      <tr id="challenge-row-${c.challenge_id}">
        <td>${c.challenge_id}</td>
        <td>${c.description}</td>
        <td>${c.points}</td>
        <td><button class="delete-btn" onclick="deleteChallenge(${c.challenge_id})">Delete</button></td>
      </tr>
    `).join("");
  } catch {
    tbody.innerHTML = `<tr><td colspan="4" class="loading">Failed to load challenges</td></tr>`;
  }
}

async function deleteUser(user_id, username) {
  if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${BASE}/admin/users/${user_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      document.getElementById(`user-row-${user_id}`)?.remove();
      showToast(`User "${username}" deleted`);
    } else {
      const d = await res.json();
      showToast(d.error || "Delete failed", true);
    }
  } catch {
    showToast("Connection error", true);
  }
}

async function deleteChallenge(challenge_id) {
  if (!confirm(`Delete challenge #${challenge_id}? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${BASE}/admin/challenges/${challenge_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      document.getElementById(`challenge-row-${challenge_id}`)?.remove();
      showToast(`Challenge #${challenge_id} deleted`);
    } else {
      const d = await res.json();
      showToast(d.error || "Delete failed", true);
    }
  } catch {
    showToast("Connection error", true);
  }
}

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = isError ? "error" : "";
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 3000);
}
