//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* accusation.html – list suspects, make accusation → redirect to ending.html
 *
 * Uses:
 * - currentUrl (from getCurrentURL.js)
 * - fetchMethod (from queryCmds.js) for all API calls
 */
(function () {
  // -------------------------------
  // 1) Basic auth guard (must have valid JWT with userId)
  // -------------------------------
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

  let userId;
  try {
    userId = JSON.parse(atob(token.split(".")[1])).userId;
  } catch {
    userId = null;
  }
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  // -------------------------------
  // 2) Frequently used DOM elements
  // -------------------------------
  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");
  const suspectsContentEl = document.getElementById("suspectsContent");
  const modalEl = document.getElementById("accuseConfirmModal");
  const nameEl = document.getElementById("accuseSuspectName");
  const errEl = document.getElementById("accuseError");
  const confirmBtn = document.getElementById("btnConfirmAccuse");

  // These hold data from the backend once loaded
  let progress = null;
  let suspects = [];
  let pendingSuspectId = null;

  // Small utility to safely inject text into HTML
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // Render username + current points in the navbar
  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent =
      typeof points === "number" ? String(points) : "0";
  }

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // -------------------------------
  // 3) Initial load: profile, progress, suspects
  // -------------------------------
  // Load user's profile (username, points)
  fetchMethod(
    currentUrl + "/api/users/" + userId,
    (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 200 && data) setProfile(data.username, data.points);
    },
    "GET",
    null,
    token
  );

  // Load case progress for this user (are they allowed to accuse?)
  fetchMethod(
    currentUrl + "/api/progress/" + userId,
    (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 200 && data) progress = data;
      tryRenderSuspects();
    },
    "GET",
    null,
    token
  );

  // Load full suspects list (used to render cards + modal)
  fetchMethod(
    currentUrl + "/api/suspects",
    (status, data) => {
      if (status === 401 || status === 403) {
        // suspects are public, but if auth ever required, handle here
        handleAuthError(status);
        return;
      }
      suspects = status === 200 && Array.isArray(data) ? data : [];
      tryRenderSuspects();
    },
    "GET",
    null,
    null
  );

  // Once we have BOTH progress + suspects, we can render the grid
  function tryRenderSuspects() {
    if (progress === null || !Array.isArray(suspects)) return;

    if (!suspects.length) {
      suspectsContentEl.innerHTML = '<p class="muted">No suspects data.</p>';
      return;
    }

    const canAccuse = progress.can_accuse && !progress.has_accused;

    suspectsContentEl.className = "suspects-row";
    suspectsContentEl.innerHTML = suspects
      .map((s) => {
        const accuseButton = canAccuse
          ? `<button type="button" class="btn-accuse" data-suspect-id="${escapeHtml(
              String(s.suspect_id)
            )}" data-suspect-name="${escapeHtml(
              (s.name || "this suspect").replace(/"/g, "&quot;")
            )}">Accuse</button>`
          : "";
        const imageHtml = s.image_url
          ? `<img class="suspect-image" src="${escapeHtml(
              s.image_url
            )}" alt="" loading="lazy" />`
          : '<div class="suspect-placeholder">?</div>';
        const titleOverlay = `<span class="suspect-title-overlay">${escapeHtml(
          s.name || "Suspect"
        )}</span>`;

        return `
          <div class="game-suspect game-suspect--card" data-suspect-id="${escapeHtml(
            String(s.suspect_id)
          )}">
            <div class="suspect-image-wrap" title="${escapeHtml(
              s.name || "Suspect"
            )}">
              ${imageHtml}${titleOverlay}
            </div>
            <div class="suspect-alias">${
              s.alias ? escapeHtml(s.alias) : "—"
            }</div>
            <div class="suspect-status">${escapeHtml(
              s.status || "Unknown"
            )}</div>
            ${accuseButton}
          </div>`;
      })
      .join("");

    wireAccuseButtons();
    wireSuspectModal();
  }

  // Wire up "Accuse" buttons + confirmation modal
  function wireAccuseButtons() {
    const bsModal =
      modalEl && window.bootstrap && window.bootstrap.Modal
        ? new window.bootstrap.Modal(modalEl, { backdrop: "static" })
        : null;

    function showError(msg) {
      if (!errEl) return;
      errEl.textContent = msg || "Could not submit accusation.";
      errEl.style.display = "block";
    }

    function clearError() {
      if (!errEl) return;
      errEl.textContent = "";
      errEl.style.display = "none";
    }

    function setConfirmLoading(isLoading) {
      if (!confirmBtn) return;
      confirmBtn.disabled = !!isLoading;
      confirmBtn.textContent = isLoading ? "Submitting..." : "Accuse";
    }

    suspectsContentEl
      .querySelectorAll(".btn-accuse")
      .forEach((btn) =>
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!bsModal) return;

          const sid = btn.getAttribute("data-suspect-id");
          const name = btn.getAttribute("data-suspect-name") || "this suspect";
          if (!sid || !userId) return;

          pendingSuspectId = parseInt(sid, 10);
          if (nameEl) nameEl.textContent = name;
          clearError();
          setConfirmLoading(false);
          bsModal.show();
        })
      );

    if (confirmBtn) {
      confirmBtn.onclick = function () {
        if (!pendingSuspectId || !userId) return;

        clearError();
        setConfirmLoading(true);

        const accuseCallback = (status, data) => {
          if (status === 200 || status === 201) {
            window.location.href = "ending.html";
            return;
          }
          showError((data && data.message) || "Could not submit accusation.");
          setConfirmLoading(false);
        };

        fetchMethod(
          currentUrl + "/api/accusation",
          accuseCallback,
          "POST",
          { suspect_id: pendingSuspectId },
          token
        );
      };
    }

    if (modalEl) {
      modalEl.addEventListener("hidden.bs.modal", () => {
        pendingSuspectId = null;
        clearError();
        setConfirmLoading(false);
      });
    }
  }

  // Clicking on suspect image opens a detail modal (bio, alibi, etc.)
  function wireSuspectModal() {
    suspectsContentEl
      .querySelectorAll(".game-suspect--card .suspect-image-wrap")
      .forEach((wrap) => {
        wrap.style.cursor = "pointer";
        wrap.addEventListener("click", () => {
          const card = wrap.closest(".game-suspect--card");
          const sid = card
            ? parseInt(card.getAttribute("data-suspect-id"), 10)
            : 0;
          const s = suspects.find((x) => x.suspect_id === sid);
          if (s) showSuspectModal(s);
        });
      });
  }

  // Build and show the suspect detail modal
  function showSuspectModal(s) {
    let modal = document.getElementById("suspectModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "suspectModal";
      modal.className = "clue-modal-overlay suspect-modal-overlay";
      modal.innerHTML =
        '<div class="clue-modal-card suspect-modal-card">' +
        '<button type="button" class="clue-modal-close" aria-label="Close">&times;</button>' +
        '<div class="suspect-modal-content"></div>' +
        "</div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function (e) {
        if (
          e.target === modal ||
          e.target.classList.contains("clue-modal-close")
        ) {
          modal.style.display = "none";
        }
      });
    }

    const content = modal.querySelector(".suspect-modal-content");
    const imgHtml = s.image_url
      ? '<div class="clue-modal-image-wrap"><img class="clue-modal-image" src="' +
        escapeHtml(s.image_url) +
        '" alt="" /></div>'
      : "";

    content.innerHTML =
      imgHtml +
      '<div class="clue-modal-name">' +
      escapeHtml(s.name || "Suspect") +
      "</div>" +
      (s.alias
        ? '<div class="clue-modal-type">' + escapeHtml(s.alias) + "</div>"
        : "") +
      '<div class="clue-modal-type">' +
      escapeHtml(s.status || "Unknown") +
      "</div>" +
      (s.bio
        ? '<div class="clue-modal-desc">' + escapeHtml(s.bio) + "</div>"
        : "") +
      (s.alibi
        ? '<p class="suspect-modal-alibi"><strong>Alibi:</strong> ' +
          escapeHtml(s.alibi) +
          "</p>"
        : "");

    modal.style.display = "flex";
  }
})();
