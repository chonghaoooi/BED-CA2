//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* profile.html – stats + edit username
 *
 * Responsibilities:
 * - Auth guard (JWT)
 * - Show summary stats:
 *   - username, points
 *   - clues collected X / Y
 *   - ending title (if any)
 * - Allow user to update username via PUT /api/users/:id
 */
(function () {
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
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.userId;
  } catch (_) {
    window.location.href = "index.html";
    return;
  }
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  // ------------------------------
  // 2) DOM handles + helpers
  // ------------------------------
  const form = document.getElementById("usernameForm");
  const usernameInput = document.getElementById("username");
  const formError = document.getElementById("formError");
  const btnSave = document.getElementById("btnSave");
  const statUsername = document.getElementById("statUsername");
  const statPoints = document.getElementById("statPoints");
  const statClues = document.getElementById("statClues");
  const statEnding = document.getElementById("statEnding");

  function showError(msg) {
    formError.textContent = msg || "";
    formError.hidden = !msg;
  }

  // Render top "Your stats" card
  function setStats(user, progress, ending) {
    if (statUsername) statUsername.textContent = user && user.username ? user.username : "—";
    if (statPoints) statPoints.textContent = user && typeof user.points === "number" ? String(user.points) : "0";
    if (statClues && progress) {
      var collected = progress.clues_collected != null ? progress.clues_collected : 0;
      var total = progress.total_clues != null ? progress.total_clues : 0;
      statClues.textContent = collected + " / " + total;
    } else if (statClues) {
      statClues.textContent = "0 / 0";
    }
    if (statEnding) {
      if (ending && ending.title) {
        statEnding.textContent = ending.title;
        statEnding.className = "profile-stat-value profile-stat-ending" + (ending.is_true_culprit ? " profile-stat-ending--correct" : " profile-stat-ending--wrong");
      } else {
        statEnding.textContent = "No ending yet";
        statEnding.className = "profile-stat-value profile-stat-ending";
      }
    }
  }

  /* Load current user, progress, and ending; fill stats and username form
   * This mirrors a single "callback" style by wrapping each fetchMethod
   * call in a small Promise, then combining with Promise.all.
   */
  Promise.all([
    new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/users/" + userId,
        function (status, data) {
          if (handleAuthError(status)) { resolve(null); return; }
          resolve(status === 200 ? data : null);
        },
        "GET",
        null,
        token
      );
    }),
    new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/progress/" + userId,
        function (status, data) {
          if (handleAuthError(status)) { resolve(null); return; }
          resolve(status === 200 ? data : null);
        },
        "GET",
        null,
        token
      );
    }),
    new Promise(function (resolve) {
      fetchMethod(
        currentUrl + "/api/ending/" + userId,
        function (status, data) {
          if (handleAuthError(status)) { resolve(null); return; }
          if (status === 200) resolve(data);
          else resolve(null);
        },
        "GET",
        null,
        token
      );
    })
  ])
    .then(function (results) {
      var user = results[0];
      var progress = results[1];
      var ending = results[2];
      setStats(user, progress, ending);
      if (user && user.username) {
        usernameInput.value = user.username;
        usernameInput.setAttribute("data-current-points", String(user.points != null ? user.points : 0));
      }
    })
    .catch(function () {
      if (statUsername) statUsername.textContent = "—";
      if (statPoints) statPoints.textContent = "0";
      if (statClues) statClues.textContent = "0 / 0";
      if (statEnding) { statEnding.textContent = "—"; statEnding.className = "profile-stat-value"; }
      showError("Could not load your profile.");
    });

  // ------------------------------
  // 3) Save updated username
  // ------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");
    const newUsername = usernameInput.value.trim();
    if (!newUsername) {
      showError("Username is required.");
      return;
    }
    const pointsStr = usernameInput.getAttribute("data-current-points");
    const points = pointsStr != null ? parseInt(pointsStr, 10) : 0;
    if (isNaN(points)) {
      showError("Invalid profile data. Please refresh and try again.");
      return;
    }

    btnSave.disabled = true;

    fetchMethod(
      currentUrl + "/api/users/" + userId,
      function (status, data) {
        if (handleAuthError(status)) return;
        if (status >= 200 && status < 300 && data) {
          usernameInput.setAttribute("data-current-points", String(data.points != null ? data.points : points));
          window.location.href = "home.html";
        } else {
          showError((data && data.message) || "Could not update username.");
          btnSave.disabled = false;
        }
      },
      "PUT",
      { username: newUsername, points: points },
      token
    );
  });

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
})();
