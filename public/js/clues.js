//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* clues.html – evidence board grid
 *
 * Responsibilities:
 * - Auth guard (JWT)
 * - Load all clues from /api/items
 * - Load this user's inventory from /api/inventory/:user_id
 * - Show 1×5 card row where unlocked clues are in full color and locked ones are grey
 * - Click unlocked clue → show big clue modal with full description
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

  // Endpoints for this page
  var apiItems = currentUrl + "/api/items";
  var apiInventory = currentUrl + "/api/inventory/" + userId;

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

  // Logout back to index
  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // Simple escaping helper used in innerHTML-building
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // Will hold user's owned clues and all possible clues
  let inventory = [];
  let allClues = [];

  // Load this user's owned clues (/api/inventory/:user_id)
  function loadInventory() {
    return new Promise(function (resolve) {
      fetchMethod(
        apiInventory,
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

  // Load the full list of clues (/api/items)
  function loadAllClues() {
    return new Promise(function (resolve) {
      fetchMethod(
        apiItems,
        function (status, arr) {
          if (status === 401 || status === 403) {
            handleAuthError(status);
            allClues = [];
            resolve(allClues);
            return;
          }
          if (status === 200 && Array.isArray(arr)) {
            allClues = arr;
          } else {
            allClues = [];
          }
          resolve(allClues);
        },
        "GET",
        null,
        token
      );
    });
  }

  // Prefer DB image_url, otherwise fall back to hardcoded images
  function getClueImage(clue) {
    if (clue && clue.image_url) return clue.image_url;
    var fallback = { 1: "images/BlueOrchid.png", 2: "images/tornReceipt.png", 3: "images/figure.png", 4: "images/coat.png", 5: "images/cipher.png" };
    return (clue && fallback[clue.item_id]) || "";
  }

  // Check if the user already owns a given clue id
  function hasClue(itemId) {
    var id = Number(itemId);
    return inventory.some(function (c) { return Number(c.item_id) === id; });
  }

  // Render the 1×5 grid of cards (locked + unlocked)
  function renderClues() {
    var el = document.getElementById("cluesContent");
    if (!el) return;
    if (allClues.length === 0) {
      el.innerHTML = "<p class=\"muted\">No clues to display. Check back later.</p>";
      return;
    }
    el.className = "clues-row";
    el.innerHTML = allClues.map(function (c) {
      var unlocked = hasClue(c.item_id);
      var imgSrc = getClueImage(c);
      var imgHtml = unlocked && imgSrc
        ? '<img class="clue-image" src="' + escapeHtml(imgSrc) + '" alt="" loading="lazy" />'
        : '<div class="clue-locked-placeholder" aria-hidden="true">?</div>';
      var lockClass = unlocked ? "" : " game-clue--locked";
      var labelHtml = unlocked ? "" : '<div class="clue-locked-label">Locked</div>';
      var cursorStyle = unlocked ? ' style="cursor: pointer;"' : '';
      var titleOverlay = '<span class="clue-title-overlay">' + (unlocked ? escapeHtml(c.clue_name || "Clue") : "???") + '</span>';
      return (
        '<div class="game-clue game-clue--card' + lockClass + '" data-item-id="' + c.item_id + '">' +
          '<div class="clue-image-wrap" title="' + (unlocked ? escapeHtml(c.clue_name) : "Locked") + '"' + cursorStyle + '>' + imgHtml + titleOverlay + '</div>' +
          '<div class="clue-type">' + (unlocked ? escapeHtml(c.clue_type || "") : "—") + '</div>' +
          labelHtml +
        '</div>'
      );
    }).join("");
    attachClueClickHandlers();
  }

  // Wire click → show full-screen modal for unlocked clues
  function attachClueClickHandlers() {
    document.querySelectorAll(".game-clue--card:not(.game-clue--locked)").forEach(function (card) {
      var itemId = parseInt(card.getAttribute("data-item-id"), 10);
      var clue = allClues.find(function (c) { return c.item_id === itemId; });
      if (!clue) return;
      var imgWrap = card.querySelector(".clue-image-wrap");
      if (imgWrap) {
        imgWrap.addEventListener("click", function () { showClueModal(clue); });
      }
    });
  }

  // Build (once) and show the clue detail modal
  function showClueModal(clue) {
    var modal = document.getElementById("clueModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "clueModal";
      modal.className = "clue-modal-overlay";
      modal.innerHTML =
        '<div class="clue-modal-card">' +
          '<button type="button" class="clue-modal-close" aria-label="Close">&times;</button>' +
          '<div class="clue-modal-content"></div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener("click", function (e) {
        if (e.target === modal || e.target.classList.contains("clue-modal-close")) closeClueModal();
      });
    }
    var content = modal.querySelector(".clue-modal-content");
    var imgSrc = getClueImage(clue);
    content.innerHTML =
      (imgSrc ? '<div class="clue-modal-image-wrap"><img class="clue-modal-image" src="' + escapeHtml(imgSrc) + '" alt="" /></div>' : '') +
      '<div class="clue-modal-name">' + escapeHtml(clue.clue_name) + '</div>' +
      '<div class="clue-modal-type">' + escapeHtml(clue.clue_type) + '</div>' +
      '<div class="clue-modal-desc">' + escapeHtml(clue.description) + '</div>';
    modal.style.display = "flex";
  }

  function closeClueModal() {
    var modal = document.getElementById("clueModal");
    if (modal) modal.style.display = "none";
  }

  // ------------------------------
  // 2) Initial load (all clues + inventory)
  // ------------------------------
  Promise.all([loadAllClues(), loadInventory()]).then(function () {
    if (allClues.length === 0 && inventory.length > 0) {
      allClues = inventory.slice();
    }
    renderClues();
  }).catch(function () {
    var el = document.getElementById("cluesContent");
    if (el) el.innerHTML = "<p class=\"muted\">Could not load clues or inventory.</p>";
  });
})();
