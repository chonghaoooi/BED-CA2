//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* casefile.html – Case Hub overview
 *
 * Responsibilities:
 * - Auth guard
 * - Show profile header
 * - Live countdown timers for locked cases
 * - Summary line with points, clues collected, and whether user can accuse
 * - Show "Your Ending" card if an ending exists
 * - "Reset case" button to wipe inventory + accusation + ending
 */
(function () {
  // ------------------------------
  // 1) Auth guard + profile
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
  try { userId = JSON.parse(atob(token.split(".")[1])).userId; } catch (_) {}
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");
  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }
  // Load current user → navbar
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

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ------------------------------
  // 2) Case list summary + countdown timers
  // ------------------------------
  const hubSummary = document.getElementById("hubSummary");
  const hubCardEnding = document.getElementById("hubCardEnding");

  /* Live countdown for locked cases – start date = first visit (today),
   * stored in localStorage so it doesn’t reset on refresh.
   */
  (function () {
    var timerEls = document.querySelectorAll(".case-card-timer");
    if (timerEls.length === 0) return;
    var STORAGE_KEY = "casefileStartDate";
    var DAYS_PER_CASE = 7;

    function getStartDate() {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var d = new Date(parseInt(stored, 10));
        if (!isNaN(d.getTime())) return d;
      }
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      localStorage.setItem(STORAGE_KEY, String(today.getTime()));
      return today;
    }

    var startDate = getStartDate();

    function getUnlockTime(caseIndex) {
      var unlock = new Date(startDate.getTime());
      unlock.setFullYear(unlock.getFullYear() + 1);
      unlock.setDate(unlock.getDate() + (caseIndex - 1) * DAYS_PER_CASE);
      return unlock.getTime();
    }

    function formatCountdown(ms) {
      if (ms <= 0) return "Coming soon";
      var s = Math.floor(ms / 1000) % 60;
      var m = Math.floor(ms / 60000) % 60;
      var h = Math.floor(ms / 3600000) % 24;
      var d = Math.floor(ms / 86400000);
      var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
      if (d > 0) return d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
      if (h > 0) return pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
      if (m > 0) return pad(m) + "m " + pad(s) + "s";
      return pad(s) + "s";
    }

    function tick() {
      var now = Date.now();
      for (var i = 0; i < timerEls.length; i++) {
        var caseIndex = 2 + i;
        var unlockTime = getUnlockTime(caseIndex);
        var remaining = unlockTime - now;
        timerEls[i].textContent = formatCountdown(remaining);
      }
    }
    tick();
    setInterval(tick, 1000);
  })();

  // Escape helper for summary text
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // GET /api/progress/:user_id
  function loadProgress() {
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/progress/" + userId,
        function (status, data) {
          if (handleAuthError(status)) {
            resolve(null);
            return;
          }
          resolve(status === 200 ? data : null);
        },
        "GET",
        null,
        token
      );
    });
  }

  // GET /api/ending/:user_id (if any)
  function loadEnding() {
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/ending/" + userId,
        function (status, data) {
          if (handleAuthError(status)) {
            resolve(null);
            return;
          }
          resolve(status === 200 ? data : null);
        },
        "GET",
        null,
        token
      );
    });
  }

  // Update the hub summary line under the title
  function renderSummary(progress) {
    if (!hubSummary) return;
    if (!progress) {
      hubSummary.textContent = "Could not load your progress.";
      return;
    }
    var html = "<strong>" + escapeHtml(String(progress.points || 0)) + "</strong> points · ";
    html += "Clues: " + escapeHtml(String(progress.clues_collected || 0)) + " / " + escapeHtml(String(progress.total_clues || 0));
    if (progress.can_accuse && !progress.has_accused) {
      html += " · You can make an accusation.";
    } else if (progress.has_accused) {
      html += " · Case closed.";
    }
    hubSummary.innerHTML = html;
  }

  // ------------------------------
  // 3) Initial load of summary + ending visibility
  // ------------------------------
  if (hubSummary) {
    loadProgress().then(function (progress) {
      renderSummary(progress);
      return loadEnding().then(function (ending) {
        if (ending && hubCardEnding) hubCardEnding.style.display = "block";
      });
    });
  }

  // ------------------------------
  // 4) Reset button – clear case progress
  // ------------------------------
  var btnReset = document.getElementById("btnReset");
  if (btnReset) btnReset.addEventListener("click", function () {
    if (!confirm("Reset the case? All clues and your accusation will be cleared.")) return;

    fetchMethod(
      currentUrl + "/api/inventory/" + userId,
      function (status, data) {
        if (handleAuthError(status)) return;
        if (status === 204 || (status >= 200 && status < 300)) {
          loadProgress().then(renderSummary);
          hubCardEnding.style.display = "none";
        } else {
          alert((data && data.message) || "Reset failed");
        }
      },
      "DELETE",
      null,
      token
    );
  });
})();
