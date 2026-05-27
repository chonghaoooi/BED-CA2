//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* index.html – homepage leaderboard preview
 *
 * Shows 2 small leaderboards on the landing page:
 * - /api/leaderboard  (correct culprit)
 * - /api/leaderboard/unsolved  (wrong culprit)
 *
 * Uses fetchMethod + currentUrl.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Format seconds → "Xm Ys" / "Ys"
  function formatTime(seconds) {
    if (seconds == null || isNaN(seconds)) return "—";
    var m = Math.floor(Number(seconds) / 60);
    var s = Number(seconds) % 60;
    if (m > 0) return m + " m " + s + " s";
    return s + " s";
  }

  // Toggle loading / empty / error / table for a given panel
  function showLeaderboardState(panel, state, message) {
    var loading = panel.querySelector(".leaderboard-loading");
    var errorEl = panel.querySelector(".leaderboard-error");
    var emptyEl = panel.querySelector(".leaderboard-empty");
    var tableWrap = panel.querySelector(".leaderboard-table-wrap");
    loading.hidden = state !== "loading";
    if (errorEl) {
      errorEl.hidden = state !== "error";
      if (message) errorEl.textContent = message;
    }
    if (emptyEl) emptyEl.hidden = state !== "empty";
    if (tableWrap) tableWrap.hidden = state !== "success";
  }

  // Render a generic leaderboard table into the given <tbody>
  function renderLeaderboardTable(tbodyId, rows) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = "";
    var rankClass = { 1: "gold", 2: "silver", 3: "bronze" };
    rows.forEach(function (row, i) {
      var rank = i + 1;
      var tr = document.createElement("tr");
      var seconds = row.completion_seconds;
      tr.innerHTML =
        '<td class="leaderboard-rank ' + (rankClass[rank] || "") + '">' + rank + "</td>" +
        "<td>" + escapeHtml(row.username || "—") + "</td>" +
        '<td class="leaderboard-time">' + escapeHtml(formatTime(seconds)) + "</td>";
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // ------------------------------
  // 1) Top solvers (correct culprit)
  // ------------------------------
  var leaderboardPanel = document.querySelector(".leaderboard-panel[aria-label=\"Leaderboard\"]");
  var leaderboardRefreshBtn = document.getElementById("leaderboardRefreshBtn");

  function fetchLeaderboard() {
    if (!leaderboardPanel) return;
    showLeaderboardState(leaderboardPanel, "loading");

    const callback = (status, data) => {
      if (status === 404) {
        showLeaderboardState(leaderboardPanel, "empty");
        return;
      }
      if (status !== 200 || !Array.isArray(data)) {
        showLeaderboardState(leaderboardPanel, "error", (data && data.message) || "Failed to load leaderboard.");
        return;
      }
      if (data.length === 0) {
        showLeaderboardState(leaderboardPanel, "empty");
        return;
      }
      renderLeaderboardTable("leaderboardBody", data);
      showLeaderboardState(leaderboardPanel, "success");
    };

    fetchMethod(currentUrl + "/api/leaderboard", callback);
  }

  if (leaderboardRefreshBtn) {
    leaderboardRefreshBtn.addEventListener("click", fetchLeaderboard);
  }
  fetchLeaderboard();

  // ------------------------------
  // 2) Wrong-culprit leaderboard
  // ------------------------------
  var unsolvedPanel = document.querySelector(".leaderboard-panel[aria-label=\"The Case Remains Unsolved\"]");
  var unsolvedRefreshBtn = document.getElementById("unsolvedRefreshBtn");

  function fetchUnsolved() {
    if (!unsolvedPanel) return;
    showLeaderboardState(unsolvedPanel, "loading");

    const callback = (status, data) => {
      if (status === 404) {
        showLeaderboardState(unsolvedPanel, "empty");
        return;
      }
      if (status !== 200 || !Array.isArray(data)) {
        showLeaderboardState(unsolvedPanel, "error", (data && data.message) || "Failed to load.");
        return;
      }
      if (data.length === 0) {
        showLeaderboardState(unsolvedPanel, "empty");
        return;
      }
      renderLeaderboardTable("unsolvedBody", data);
      showLeaderboardState(unsolvedPanel, "success");
    };

    fetchMethod(currentUrl + "/api/leaderboard/unsolved", callback);
  }

  if (unsolvedRefreshBtn) {
    unsolvedRefreshBtn.addEventListener("click", fetchUnsolved);
  }
  fetchUnsolved();
});
