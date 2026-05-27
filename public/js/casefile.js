//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* case-1.html – Case Hub internals for case 1
 *
 * This script backs the older "casefile.html" style hub, where
 * everything (progress, clues, suspects, ending) is visible on one page.
 *
 * Responsibilities:
 * - Auth guard
 * - Show profile header
 * - Show progress, clues and suspects
 * - Allow accusation and storybox open/reset from the hub
 *
 * All network calls use fetchMethod + currentUrl.
 */
(function () {
  // ------------------------------
  // 1) Auth + profile
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

  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");
  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }
  if (userId) {
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
  }
  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // Simple string escaper used for building HTML
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // These store all the hub data once loaded
  let progress = null;
  let inventory = [];
  let suspects = [];

  // GET /api/progress/:user_id and cache it
  function loadProgress() {
    if (!userId) return Promise.resolve(null);
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/progress/" + userId,
        function (status, p) {
          if (handleAuthError(status)) {
            resolve(null);
            return;
          }
          if (status === 200 && p) {
            progress = p;
            resolve(p);
          } else {
            resolve(null);
          }
        },
        "GET",
        null,
        token
      );
    });
  }

  // GET /api/inventory/:user_id for this user
  function loadInventory() {
    if (!userId) return Promise.resolve([]);
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/inventory/" + userId,
        function (status, arr) {
          if (handleAuthError(status)) {
            inventory = [];
            resolve(inventory);
            return;
          }
          if (status === 200 && Array.isArray(arr)) {
            inventory = arr;
          } else {
            inventory = [];
          }
          resolve(inventory);
        },
        "GET",
        null,
        token
      );
    });
  }

  // GET /api/suspects (static list shared across users)
  function loadSuspects() {
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/suspects",
        function (status, arr) {
          if (status === 401 || status === 403) {
            handleAuthError(status);
            suspects = [];
            resolve(suspects);
            return;
          }
          if (status === 200 && Array.isArray(arr)) {
            suspects = arr;
          } else {
            suspects = [];
          }
          resolve(suspects);
        }
      );
    });
  }

  // GET /api/ending/:user_id, if any
  function loadEnding() {
    if (!userId) return Promise.resolve(null);
    return new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/ending/" + userId,
        function (status, e) {
          if (handleAuthError(status)) {
            resolve(null);
            return;
          }
          if (status === 200 && e) resolve(e);
          else resolve(null);
        },
        "GET",
        null,
        token
      );
    });
  }

  // Render top "Your status" style block
  function renderProgress() {
    const el = document.getElementById("progressContent");
    if (!progress) {
      el.innerHTML = "<p class=\"cf-loading\">Could not load progress.</p>";
      return;
    }
    el.innerHTML =
      "<p><strong>" + escapeHtml(String(progress.points || 0)) + "</strong> points</p>" +
      "<p class=\"muted\">Clues: " + escapeHtml(String(progress.clues_collected || 0)) + " / " + escapeHtml(String(progress.total_clues || 0)) + "</p>" +
      (progress.can_accuse ? "<p class=\"muted\">You can make an accusation.</p>" : "") +
      (progress.has_accused ? "<p class=\"muted\">You have made an accusation.</p>" : "");
  }

  // Render "Your clues" section
  function renderClues() {
    const el = document.getElementById("cluesContent");
    if (inventory.length === 0) {
      el.innerHTML = "<p class=\"muted\">No clues yet. Open a storybox to get one.</p>";
      return;
    }
    el.innerHTML = inventory.map(function (c) {
      return (
        '<div class="cf-clue">' +
          '<div class="clue-name">' + escapeHtml(c.clue_name || "Clue") + '</div>' +
          '<div class="clue-type">' + escapeHtml(c.clue_type || "") + '</div>' +
          '<div class="clue-desc">' + escapeHtml(c.description || "") + '</div>' +
        '</div>'
      );
    }).join("");
  }

  // Render suspects list in the hub, with inline "Accuse" buttons
  function renderSuspects() {
    const el = document.getElementById("suspectsContent");
    if (suspects.length === 0) {
      el.innerHTML = "<p class=\"muted\">No suspects data.</p>";
      return;
    }
    const canAccuse = progress && progress.can_accuse && !progress.has_accused;
    el.innerHTML = suspects.map(function (s) {
      var accuseBtn = canAccuse
        ? '<button type="button" class="btn-accuse" data-suspect-id="' + escapeHtml(String(s.suspect_id)) + '" data-suspect-name="' + escapeHtml(s.name || "this suspect") + '">Accuse</button>'
        : '';
      return (
        '<div class="cf-suspect">' +
          '<div class="suspect-name">' + escapeHtml(s.name || "") + '</div>' +
          (s.alias ? '<div class="suspect-alias">' + escapeHtml(s.alias) + '</div>' : '') +
          (s.bio ? '<div class="suspect-bio">' + escapeHtml(s.bio) + '</div>' : '') +
          accuseBtn +
        '</div>'
      );
    }).join("");
    el.querySelectorAll(".btn-accuse").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sid = this.getAttribute("data-suspect-id");
        var sname = this.getAttribute("data-suspect-name") || "this suspect";
        if (!sid || !userId) return;
        if (!confirm("Accuse " + sname + "? This is your final decision.")) return;
        this.disabled = true;

        fetchMethod(
          currentUrl + "/api/accusation",
          function (status, ending) {
            if (handleAuthError(status)) return;
            if (status >= 200 && status < 300 && ending) {
              refreshAll();
              var endingSection = document.getElementById("endingSection");
              var endingContent = document.getElementById("endingContent");
              endingSection.hidden = false;
              endingContent.innerHTML =
                '<p class="muted">You accused <strong>' + escapeHtml(sname) + '</strong>.</p>' +
                '<div class="ending-title">' + escapeHtml(ending.title || "") + '</div>' +
                '<div class="muted">' + escapeHtml(ending.description || "") + '</div>';
              endingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              alert((ending && ending.message) || "Could not submit accusation.");
              btn.disabled = false;
            }
          },
          "POST",
          { user_id: userId, suspect_id: parseInt(sid, 10) },
          token
        );
      });
    });
  }

  // Render the "Your ending" block (if any)
  function renderEnding(ending) {
    const section = document.getElementById("endingSection");
    const content = document.getElementById("endingContent");
    if (!ending) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    var accusedName = null;
    if (ending.suspect_id && suspects.length) {
      var suspect = suspects.find(function (s) { return s.suspect_id == ending.suspect_id; });
      accusedName = suspect ? suspect.name : null;
    }
    content.innerHTML =
      (accusedName ? '<p class="muted">You accused <strong>' + escapeHtml(accusedName) + '</strong>.</p>' : '') +
      '<div class="ending-title">' + escapeHtml(ending.title || "") + '</div>' +
      '<div class="muted">' + escapeHtml(ending.description || "") + '</div>';
  }

  // Reload progress, inventory, suspects, ending after state-changing actions
  function refreshAll() {
    loadProgress().then(function () {
      renderProgress();
      const btn = document.getElementById("btnOpenStorybox");
      if (progress) {
        btn.disabled = (progress.points < 20) || (progress.clues_collected >= progress.total_clues);
      }
      loadInventory().then(renderClues);
      loadSuspects().then(function () {
        renderSuspects();
        loadEnding().then(renderEnding);
      });
      if (userId) {
        fetchMethod(
          currentUrl + "/api/users/" + userId,
          function (status, u) { if (status === 200 && u) setProfile(u.username, u.points); },
          "GET",
          null,
          token
        );
      }
    });
  }

  // ------------------------------
  // 2) Open storybox (spend 20 points)
  // ------------------------------
  document.getElementById("btnOpenStorybox").addEventListener("click", function () {
    if (!userId) return;
    var btn = this;
    document.getElementById("storyboxError").hidden = true;
    btn.disabled = true;

    fetchMethod(
      currentUrl + "/api/storybox/open",
      function (status, clue) {
        if (handleAuthError(status)) return;
        if (status >= 200 && status < 300) {
          refreshAll();
          if (clue && clue.clue_name) {
            alert("You obtained: " + clue.clue_name);
          }
        } else {
          document.getElementById("storyboxError").textContent =
            (clue && clue.message) || "Failed.";
          document.getElementById("storyboxError").hidden = false;
        }
        btn.disabled = false;
      },
      "POST",
      { user_id: userId },
      token
    );
  });

  // ------------------------------
  // 3) Reset hub (clear inventory + accusation + ending)
  // ------------------------------
  document.getElementById("btnReset").addEventListener("click", function () {
    if (!userId) return;
    if (!confirm("Reset the case? All clues and your accusation will be cleared.")) return;

    fetchMethod(
      currentUrl + "/api/inventory/" + userId,
      function (status, data) {
        if (handleAuthError(status)) return;
        if (status === 204 || (status >= 200 && status < 300)) {
          refreshAll();
          document.getElementById("endingSection").hidden = true;
        } else {
          alert((data && data.message) || "Reset failed");
        }
      },
      "DELETE",
      null,
      token
    );
  });

  // ------------------------------
  // 4) Initial load
  // ------------------------------
  loadProgress().then(function () {
    renderProgress();
    var btn = document.getElementById("btnOpenStorybox");
    if (progress) {
      btn.disabled = (progress.points < 20) || (progress.clues_collected >= progress.total_clues);
    }
  });
  loadInventory().then(renderClues);
  loadSuspects().then(function () {
    renderSuspects();
    loadEnding().then(renderEnding);
  });
})();
