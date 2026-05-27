//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* wellness.html – wellness challenge CRUD + completion
 *
 * Responsibilities:
 * - JWT auth guard
 * - Show profile (username + points)
 * - List all challenges (owned by anyone)
 * - Allow current user to:
 *   - create new challenges
 *   - complete a challenge with a description (points awarded)
 *   - edit/delete their own challenges
 *
 * All backend calls use fetchMethod + currentUrl.
 */
(function () {
  // ------------------------------
  // 1) Auth + profile wiring
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

  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");

  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }

  if (userId) {
    const userCallback = (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 200 && data) {
        setProfile(data.username, data.points);
      }
    };
    fetchMethod(currentUrl + "/api/users/" + userId, userCallback, "GET", null, token);
  }

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ------------------------------
  // 2) DOM handles for list + creation + modal
  // ------------------------------
  const challengeLoading = document.getElementById("challengeLoading");
  const challengeError = document.getElementById("challengeError");
  const challengeList = document.getElementById("challengeList");
  const createForm = document.getElementById("createChallengeForm");
  const createErrorEl = document.getElementById("createError");
  const btnCreateChallenge = document.getElementById("btnCreateChallenge");

  // Small escaping helper for strings inserted into innerHTML
  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // Mark a challenge card as completed in the UI (and show user description)
  function setCompleted(challengeId, completed, details) {
    const card = document.querySelector('[data-challenge-id="' + challengeId + '"]');
    if (!card) return;
    card.classList.toggle("completed", !!completed);
    const btn = card.querySelector(".btn-complete");
    const badge = card.querySelector(".badge-done");
    const detailsEl = card.querySelector(".completion-details");
    if (btn) {
      btn.hidden = !!completed;
      btn.disabled = !!completed;
    }
    if (badge) badge.hidden = !completed;
    if (detailsEl) {
      detailsEl.hidden = !completed;
      detailsEl.textContent = completed && details ? details : "";
    }
  }

  // Tracks which challenge is being completed in the "describe what you did" modal
  let pendingCompleteChallengeId = null;
  let pendingCompleteBtn = null;
  const completionModalOverlay = document.getElementById("completionModalOverlay");
  const completionDetailsInput = document.getElementById("completionDetailsInput");
  const btnSubmitComplete = document.getElementById("btnSubmitComplete");
  const btnCancelComplete = document.getElementById("btnCancelComplete");

  // Open "complete challenge" modal for the selected card
  function openCompleteModal(challengeId, btn) {
    pendingCompleteChallengeId = challengeId;
    pendingCompleteBtn = btn;
    completionDetailsInput.value = "";
    completionModalOverlay.classList.add("show");
    completionDetailsInput.focus();
  }

  // Close the completion modal and clear state
  function closeCompleteModal() {
    pendingCompleteChallengeId = null;
    pendingCompleteBtn = null;
    completionModalOverlay.classList.remove("show");
  }

  btnCancelComplete.addEventListener("click", closeCompleteModal);
  completionModalOverlay.addEventListener("click", function (e) {
    if (e.target === completionModalOverlay) closeCompleteModal();
  });

  // When user confirms completion, POST to /api/challenges/{id}
  btnSubmitComplete.addEventListener("click", function () {
    const details = completionDetailsInput.value.trim();
    if (!details) {
      alert("Please enter a description of what you did.");
      return;
    }
    if (!pendingCompleteChallengeId || !userId) {
      closeCompleteModal();
      return;
    }
    const challengeId = pendingCompleteChallengeId;
    const btn = pendingCompleteBtn;
    btn.disabled = true;

    const completeCallback = (status, data) => {
      if (status === 201 || status === 200 || status === 204) {
        closeCompleteModal();
        setCompleted(challengeId, true, details);
        if (userId) {
          const refreshProfileCb = (s, u) => {
            if (s === 200 && u) setProfile(u.username, u.points);
          };
          fetchMethod(currentUrl + "/api/users/" + userId, refreshProfileCb, "GET", null, token);
        }
      } else {
        btn.disabled = false;
        alert((data && data.message) || "Could not complete challenge.");
      }
    };

    fetchMethod(
      currentUrl + "/api/challenges/" + challengeId,
      completeCallback,
      "POST",
      { user_id: userId, details: details },
      token
    );
  });

  // Entry point when user clicks "Complete" on a card
  function completeChallenge(challengeId, btn) {
    if (!userId) return;
    openCompleteModal(challengeId, btn);
  }

  // For a given challenge, check if *this* user has already completed it
  function fetchCompletionStatus(challengeId) {
    return new Promise(function (resolve) {
      const cb = (status, rows) => {
        if (handleAuthError(status) || status !== 200 || !Array.isArray(rows)) {
          resolve({ completed: false, details: null });
          return;
        }
        const mine = rows.find(function (r) { return r.user_id == userId; });
        resolve({
          completed: !!mine,
          details: mine && mine.details ? mine.details : null,
        });
      };
      fetchMethod(currentUrl + "/api/challenges/" + challengeId, cb);
    });
  }

  // Render the full list of challenges with completion + edit/delete controls
  function renderChallengeList(challenges) {
    if (!challenges || challenges.length === 0) {
      challengeList.innerHTML = "<p class=\"wellness-loading\">No wellness challenges yet.</p>";
      challengeList.hidden = false;
      return Promise.resolve();
    }
    return Promise.all(
      challenges.map(function (c) {
        return fetchCompletionStatus(c.challenge_id).then(function (status) {
          return { challenge: c, completed: status.completed, details: status.details };
        });
      })
    ).then(function (results) {
      challengeList.innerHTML = "";
      const isMine = function (creatorId) {
        return creatorId != null && String(creatorId) === String(userId);
      };
      results.forEach(function (_ref) {
        const c = _ref.challenge;
        const completed = _ref.completed;
        const completionDetails = _ref.details;
        const mine = isMine(c.creator_id);
        const card = document.createElement("div");
        card.className = "challenge-card" + (completed ? " completed" : "");
        card.dataset.challengeId = c.challenge_id;
        card.innerHTML =
          '<div class="challenge-view">' +
            '<div class="challenge-info">' +
              '<p class="challenge-desc">' + escapeHtml(c.description || "Challenge") + '</p>' +
              '<span class="challenge-points">' + escapeHtml(String(c.points || 0)) + ' pt</span>' +
              (completed && completionDetails ? '<p class="completion-details">' + escapeHtml(completionDetails) + '</p>' : '<p class="completion-details" hidden></p>') +
            '</div>' +
            '<div class="challenge-actions">' +
              (completed ? '<span class="badge-done">Done</span>' : '<button type="button" class="btn-complete">Complete</button>') +
              (mine ? ' <button type="button" class="btn-edit">Edit</button> <button type="button" class="btn-delete">Delete</button>' : '') +
            '</div>' +
          '</div>' +
          '<div class="challenge-edit">' +
            '<div class="form-group">' +
              '<label>Description</label>' +
              '<textarea class="edit-desc" rows="2">' + escapeHtml(c.description || "") + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Points</label>' +
              '<input type="number" class="edit-points" min="1" max="20" value="' + escapeHtml(String(c.points || 0)) + '" />' +
            '</div>' +
            '<div class="edit-actions">' +
              '<button type="button" class="btn-save">Save</button>' +
              '<button type="button" class="btn-cancel">Cancel</button>' +
            '</div>' +
          '</div>';
        if (!completed) {
          card.querySelector(".btn-complete").addEventListener("click", function () {
            completeChallenge(c.challenge_id, this);
          });
        }
        if (mine) {
          card.querySelector(".btn-edit").addEventListener("click", function () {
            card.classList.add("editing");
            card.querySelector(".edit-desc").value = c.description || "";
            card.querySelector(".edit-points").value = String(c.points || 0);
          });
          card.querySelector(".btn-cancel").addEventListener("click", function () {
            card.classList.remove("editing");
          });
          card.querySelector(".btn-save").addEventListener("click", function () {
            const desc = card.querySelector(".edit-desc").value.trim();
            const points = parseInt(card.querySelector(".edit-points").value, 10);
            if (!desc) { alert("Description is required."); return; }
            if (isNaN(points) || points < 1 || points > 20) { alert("Points must be 1–20."); return; }
            const saveBtn = this;
            saveBtn.disabled = true;
            fetch(currentUrl + "/api/challenges/" + c.challenge_id, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ user_id: userId, description: desc, points: points }),
            })
              .then(function (res) {
                if (res.status === 401 || res.status === 403) {
                  alert("Your session has expired. Please log in again.");
                  localStorage.removeItem("token");
                  window.location.href = "index.html";
                  return;
                }
                if (res.ok) {
                  card.classList.remove("editing");
                  loadChallenges();
                } else {
                  return res.json().then(function (d) { throw new Error(d.message || "Update failed"); });
                }
              })
              .catch(function (err) {
                alert(err.message || "Could not update challenge.");
              })
              .finally(function () { saveBtn.disabled = false; });
          });
          card.querySelector(".btn-delete").addEventListener("click", function () {
            if (!confirm("Delete this challenge? This cannot be undone.")) return;
            const delBtn = this;
            delBtn.disabled = true;
            fetch(currentUrl + "/api/challenges/" + c.challenge_id, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ user_id: userId }),
            })
              .then(function (res) {
                if (res.status === 401 || res.status === 403) {
                  alert("Your session has expired. Please log in again.");
                  localStorage.removeItem("token");
                  window.location.href = "index.html";
                  return;
                }
                if (res.ok) {
                  loadChallenges();
                } else {
                  return res.json().then(function (d) { throw new Error(d.message || "Delete failed"); });
                }
              })
              .catch(function (err) {
                alert(err.message || "Could not delete challenge.");
                delBtn.disabled = false;
              });
          });
        }
        challengeList.appendChild(card);
      });
      challengeList.hidden = false;
    });
  }

  // Load all challenges from /api/challenges and render them
  function loadChallenges() {
    challengeLoading.hidden = false;
    challengeError.hidden = true;
    challengeList.hidden = true;

    const cb = (status, data) => {
      if (handleAuthError(status)) return;
      challengeLoading.hidden = true;
      if (status === 200 && Array.isArray(data)) {
        renderChallengeList(data);
      } else {
        challengeError.textContent = (data && data.message) || "Failed to load challenges.";
        challengeError.hidden = false;
      }
    };

    fetchMethod(currentUrl + "/api/challenges", cb, "GET", null, token);
  }

  // ------------------------------
  // 3) Create new wellness challenge
  // ------------------------------
  createForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!userId) {
      createErrorEl.textContent = "You must be logged in to create a challenge.";
      createErrorEl.hidden = false;
      return;
    }
    createErrorEl.hidden = true;
    var desc = document.getElementById("newDescription").value.trim();
    var points = parseInt(document.getElementById("newPoints").value, 10);
    if (!desc) {
      createErrorEl.textContent = "Description is required.";
      createErrorEl.hidden = false;
      return;
    }
    if (isNaN(points) || points < 1 || points > 20) {
      createErrorEl.textContent = "Points must be between 1 and 20.";
      createErrorEl.hidden = false;
      return;
    }
    btnCreateChallenge.disabled = true;

    const cb = (status, data) => {
      if (status === 201 || status === 200) {
        document.getElementById("newDescription").value = "";
        document.getElementById("newPoints").value = "10";
        loadChallenges();
      } else {
        createErrorEl.textContent = (data && data.message) || "Could not create challenge.";
        createErrorEl.hidden = false;
      }
      btnCreateChallenge.disabled = false;
    };

    fetchMethod(
      currentUrl + "/api/challenges",
      cb,
      "POST",
      { description: desc, user_id: userId, points: points },
      token
    );
  });

  loadChallenges();
})();
