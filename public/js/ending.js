//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* ending.html – show player's final story ending
 *
 * Responsibilities:
 * - Auth guard
 * - Show profile header (username + points)
 * - GET /api/ending/:user_id and render either:
 *   - A styled ending card (correct vs wrong culprit)
 *   - Or a message telling player to make an accusation
 */
(function () {
  // ------------------------------
  // 1) Auth + basic setup
  // ------------------------------
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "index.html"; return; }
  let userId = null;
  try { userId = JSON.parse(atob(token.split(".")[1])).userId; } catch (_) {}
  if (!userId) { window.location.href = "index.html"; return; }
  function handleAuthError(status) {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return true;
    }
    return false;
  }

  // ------------------------------
  // 2) Profile header
  // ------------------------------
  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");
  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }
  // Load current user → navbar profile
  fetchMethod(
    currentUrl + "/api/users/" + userId,
    function (status, u) {
      if (handleAuthError(status)) return;
      if (status === 200 && u) setProfile(u.username, u.points);
    },
    "GET",
    null,
    token
  );

  // Logout back to landing
  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // Small helper for safe string insertion
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // ------------------------------
  // 3) Ending content
  // ------------------------------
  var endingIntro = document.getElementById("endingIntro");
  var endingSection = document.getElementById("endingSection");
  var endingContent = document.getElementById("endingContent");

  // Load this user's most recent ending
  fetchMethod(
    currentUrl + "/api/ending/" + userId,
    function (status, ending) {
      if (handleAuthError(status)) return;
      if (status === 200 && ending && (ending.title || ending.description)) {
        endingIntro.textContent = "You've closed the case. Here's how it ended.";
        endingSection.hidden = false;
        var isCorrect = ending.is_true_culprit === 1 || ending.is_true_culprit === true;
        endingSection.className = "game-section game-ending" + (isCorrect ? " ending--correct" : " ending--wrong");
        endingContent.innerHTML =
          '<div class="ending-title">' + escapeHtml(ending.title || "") + '</div>' +
          (isCorrect ? '<p class="ending-badge ending-badge--correct">Correct — you found the culprit.</p>' : '<p class="ending-badge ending-badge--wrong">Wrong accusation — the real culprit remains.</p>') +
          '<div class="ending-desc">' + escapeHtml(ending.description || "") + '</div>';
      } else {
        endingIntro.innerHTML = "You haven't closed the case yet. Gather clues, then make your accusation from the <a href=\"accusation.html\" class=\"nav-link\">Suspects page</a>.";
        endingSection.hidden = true;
        endingContent.innerHTML = "";
      }
    },
    "GET",
    null,
    token
  );
})();
