//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* investigation.html – storybox (spend points → reveal clue)
 *
 * Responsibilities:
 * - Auth guard
 * - Show profile header
 * - Show progress panel: points + clues collected / total
 * - Button "INVESTIGATE (20 pt)" which POSTs /api/storybox/open
 *   and then shows a nice "New evidence uncovered" modal
 */
(function () {
  // ------------------------------
  // 1) Auth + profile
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

  // Logout back to landing
  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // String escaping helper
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // Default art for clues that don't have image_url in DB
  var clueImageFallback = {
    1: "images/BlueOrchid.png",
    2: "images/tornReceipt.png",
    3: "images/figure.png",
    4: "images/coat.png",
    5: "images/cipher.png"
  };
  function getClueImage(clue) {
    if (clue.image_url) return clue.image_url;
    return clueImageFallback[clue.item_id] || "";
  }

  // Will hold user's current points + clue counts
  let progress = null;

  // GET /api/progress/:user_id and cache in progress
  function loadProgress() {
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

  // Update the "Your status" summary block
  function renderProgress() {
    var el = document.getElementById("progressContent");
    if (!progress) {
      el.innerHTML = "<p class=\"game-loading\">Could not load progress.</p>";
      return;
    }
    el.innerHTML =
      "<p><strong>" + escapeHtml(String(progress.points || 0)) + "</strong> points</p>" +
      "<p class=\"muted\">Clues: " + escapeHtml(String(progress.clues_collected || 0)) + " / " + escapeHtml(String(progress.total_clues || 0)) + "</p>";
  }

  // Refresh progress + profile after opening a storybox
  function refresh() {
    loadProgress().then(function () {
      renderProgress();
      var btn = document.getElementById("btnOpenStorybox");
      if (progress) {
        btn.disabled = (progress.points < 20) || (progress.clues_collected >= progress.total_clues);
      }
    });
    fetchMethod(
      currentUrl + "/api/users/" + userId,
      function (status, u) { if (status === 200 && u) setProfile(u.username, u.points); },
      "GET",
      null,
      token
    );
  }

  // ------------------------------
  // 2) Open storybox → POST /api/storybox/open
  // ------------------------------
  document.getElementById("btnOpenStorybox").addEventListener("click", function () {
    var btn = this;
    document.getElementById("storyboxError").hidden = true;
    btn.disabled = true;
    fetchMethod(
      currentUrl + "/api/storybox/open",
      function (status, clue) {
        if (status === 200 || status === 201) {
          refresh();
          if (clue && clue.clue_name) showClueRevealModal(clue);
        } else {
          document.getElementById("storyboxError").textContent =
            (clue && clue.message) || "Failed.";
          document.getElementById("storyboxError").hidden = false;
        }
        btn.disabled = false;
      },
      "POST",
      {},
      token
    );
  });

  // Build and show the "New evidence uncovered" modal
  function showClueRevealModal(clue) {
    var modal = document.getElementById("clueRevealModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "clueRevealModal";
      modal.className = "clue-reveal-overlay";
      modal.setAttribute("aria-label", "New clue revealed");
      modal.innerHTML =
        '<div class="clue-reveal-card">' +
          '<div class="clue-reveal-headline">New evidence uncovered</div>' +
          '<div class="clue-reveal-content"></div>' +
          '<a href="clues.html" class="btn-primary-game clue-reveal-view">View clues →</a>' +
          '<button type="button" class="clue-reveal-close" aria-label="Close">Continue</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener("click", function (e) {
        if (e.target === modal || e.target.classList.contains("clue-reveal-close")) closeClueRevealModal();
      });
    }
    var content = modal.querySelector(".clue-reveal-content");
    var imgSrc = getClueImage(clue);
    content.innerHTML =
      (imgSrc ? '<div class="clue-reveal-image-wrap"><img class="clue-reveal-image" src="' + escapeHtml(imgSrc) + '" alt="" /></div>' : '') +
      '<div class="clue-reveal-name">' + escapeHtml(clue.clue_name || "Clue") + '</div>' +
      '<div class="clue-reveal-type">' + escapeHtml(clue.clue_type || "") + '</div>' +
      '<p class="clue-reveal-tagline">Added to your evidence board.</p>';
    modal.style.display = "flex";
    modal.classList.add("clue-reveal-visible");
  }

  function closeClueRevealModal() {
    var modal = document.getElementById("clueRevealModal");
    if (modal) {
      modal.classList.remove("clue-reveal-visible");
      modal.style.display = "none";
    }
  }

  // ------------------------------
  // 3) Initial load
  // ------------------------------
  loadProgress().then(function () {
    renderProgress();
    var btn = document.getElementById("btnOpenStorybox");
    if (progress) btn.disabled = (progress.points < 20) || (progress.clues_collected >= progress.total_clues);
  });
})();
