//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* leaderboard.html – full-screen leaderboard page
 *
 * Responsibilities:
 * - JWT auth guard (must be logged in)
 * - Load user profile (username + points)
 * - Load /api/leaderboard and /api/leaderboard/unsolved using fetchMethod
 * - Render both tables with basic loading / empty / error states
 */
(function () {
  // currentUrl and fetchMethod are provided globally by getCurrentURL.js and queryCmds.js
  // ------------------------------
  // 1) Auth guard
  // ------------------------------
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }
  function handleAuthError(status) {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return true;
    }
    return false;
  }

  let userId = null;
  try {
    userId = JSON.parse(atob(token.split(".")[1])).userId;
  } catch (_) {}

  // ------------------------------
  // 2) Profile display
  // ------------------------------
  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");

  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }

  if (userId) {
    const profileCallback = (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 200 && data) {
        setProfile(data.username, data.points);
      }
    };
    fetchMethod(currentUrl + "/api/users/" + userId, profileCallback, "GET", null, token);
  }

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ------------------------------
  // 3) Shared helpers
  // ------------------------------
  function formatTime(seconds) {
    if (seconds == null || isNaN(seconds)) return "—";
    var m = Math.floor(Number(seconds) / 60);
    var s = Number(seconds) % 60;
    if (m > 0) return m + " m " + s + " s";
    return s + " s";
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // Show "loading" / "empty" / "error" / "success" for a panel
  function showState(panel, state, message) {
    var loading = panel.querySelector(".lb-loading");
    var errorEl = panel.querySelector(".lb-error");
    var emptyEl = panel.querySelector(".lb-empty");
    var tableWrap = panel.querySelector(".lb-table-wrap");
    loading.hidden = state !== "loading";
    if (errorEl) {
      errorEl.hidden = state !== "error";
      if (message) errorEl.textContent = message;
    }
    if (emptyEl) emptyEl.hidden = state !== "empty";
    if (tableWrap) tableWrap.hidden = state !== "success";
  }

  // Render a leaderboard-style table into the given <tbody>
  function renderTable(tbodyId, rows) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = "";
    var rankClass = { 1: "gold", 2: "silver", 3: "bronze" };
    rows.forEach(function (row, i) {
      var rank = i + 1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="lb-rank ' + (rankClass[rank] || "") + '">' + rank + "</td>" +
        "<td>" + escapeHtml(row.username || "—") + "</td>" +
        '<td class="lb-time">' + escapeHtml(formatTime(row.completion_seconds)) + "</td>";
      tbody.appendChild(tr);
    });
  }

  // ------------------------------
  // 4) Fetch top-solvers leaderboard
  // ------------------------------
  var leaderboardPanel = document.querySelector('.lb-panel[aria-label="Top solvers"]');
  var unsolvedPanel = document.querySelector('.lb-panel[aria-label="The case remains unsolved"]');

  function fetchLeaderboard() {
    if (!leaderboardPanel) return;
    showState(leaderboardPanel, "loading");

    const callback = (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 404) {
        showState(leaderboardPanel, "empty");
        return;
      }
      if (status !== 200 || !Array.isArray(data)) {
        showState(leaderboardPanel, "error", (data && data.message) || "Failed to load.");
        return;
      }
      if (data.length === 0) {
        showState(leaderboardPanel, "empty");
        return;
      }
      renderTable("leaderboardBody", data);
      showState(leaderboardPanel, "success");
    };

    fetchMethod(currentUrl + "/api/leaderboard", callback);
  }

  // ------------------------------
  // 5) Fetch wrong-culprit leaderboard
  // ------------------------------
  function fetchUnsolved() {
    if (!unsolvedPanel) return;
    showState(unsolvedPanel, "loading");

    const callback = (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 404) {
        showState(unsolvedPanel, "empty");
        return;
      }
      if (status !== 200 || !Array.isArray(data)) {
        showState(unsolvedPanel, "error", (data && data.message) || "Failed to load.");
        return;
      }
      if (data.length === 0) {
        showState(unsolvedPanel, "empty");
        return;
      }
      renderTable("unsolvedBody", data);
      showState(unsolvedPanel, "success");
    };

    fetchMethod(currentUrl + "/api/leaderboard/unsolved", callback);
  }

  document.getElementById("leaderboardRefreshBtn").addEventListener("click", fetchLeaderboard);
  document.getElementById("unsolvedRefreshBtn").addEventListener("click", fetchUnsolved);

  fetchLeaderboard();
  fetchUnsolved();
})();
