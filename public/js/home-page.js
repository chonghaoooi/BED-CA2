//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* home.html – dashboard hub
 *
 * Responsibilities:
 * - Ensure user has a valid JWT token
 * - Show profile (username + points) using fetchMethod + currentUrl
 * - Sherlock "speech bubble" interactions
 * - Hub buttons (Casefile, Wellness, Leaderboard) navigation
 */
(function () {
  // ------------------------------
  // 1) Sherlock quote bubble
  // ------------------------------
  var sherlockDialogues = [
    "Elementary. Pick a case from your desk.",
    "The game is afoot. Where shall we go?",
    "When you have eliminated the impossible, whatever remains must be the next page.",
    "Data, data, data—I cannot make bricks without clay. Check your case file.",
    "You see, but you do not observe. The leaderboard awaits.",
    "A small step for deduction, a leap for your wellness. Try the quests.",
  ];
  var sherlockIndex = 0;
  var sherlockEl = document.getElementById("sherlockDialogueText");
  var sherlockBlock = document.getElementById("sherlockBlock");
  function nextSherlockDialogue() {
    if (!sherlockEl || !sherlockDialogues.length) return;
    sherlockIndex = (sherlockIndex + 1) % sherlockDialogues.length;
    sherlockEl.textContent = sherlockDialogues[sherlockIndex];
  }
  function pickRandomSherlockDialogue() {
    if (!sherlockEl || !sherlockDialogues.length) return;
    sherlockIndex = Math.floor(Math.random() * sherlockDialogues.length);
    sherlockEl.textContent = sherlockDialogues[sherlockIndex];
  }
  if (sherlockBlock) {
    pickRandomSherlockDialogue();
    sherlockBlock.addEventListener("click", nextSherlockDialogue);
    sherlockBlock.setAttribute("title", "Click for another line");
  }

  // ------------------------------
  // 2) Auth guard – must have token
  // ------------------------------
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    throw new Error("No token");
  }
  function handleAuthError(status) {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return true;
    }
    return false;
  }

  // ------------------------------
  // 3) Profile header – load current user via fetchMethod
  // ------------------------------
  const profileUsernameEl = document.getElementById("profileUsername");
  const profilePointsEl = document.getElementById("profilePoints");
  function setProfile(username, points) {
    profileUsernameEl.textContent = username || "—";
    profilePointsEl.textContent = typeof points === "number" ? String(points) : "0";
  }
  (function loadCurrentUser() {
    let userId;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.userId;
    } catch (_) {
      // malformed token → force logout
      handleAuthError(401);
      return;
    }
    if (!userId) {
      handleAuthError(401);
      return;
    }

    const callback = (status, data) => {
      if (handleAuthError(status)) return;
      if (status === 200 && data) {
        setProfile(data.username, data.points);
      }
      // Non-200 errors for profile just leave default placeholders
    };

    fetchMethod(currentUrl + "/api/users/" + userId, callback, "GET", null, token);
  })();

  // ------------------------------
  // 4) Logout button
  // ------------------------------
  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ------------------------------
  // 5) Hover image swaps for hub cards
  // ------------------------------
  document.querySelectorAll(".state-btn").forEach(function (btn) {
    var img = btn.querySelector("img");
    if (!img) return;
    var idleSrc = btn.dataset.idle;
    var activeSrc = btn.dataset.active;
    if (!idleSrc || !activeSrc) return;
    function setState(active) {
      img.src = active ? activeSrc : idleSrc;
    }
    btn.addEventListener("mouseenter", function () { setState(true); });
    btn.addEventListener("mouseleave", function () { setState(false); });
    btn.addEventListener("focus", function () { setState(true); });
    btn.addEventListener("blur", function () { setState(false); });
  });

  // ------------------------------
  // 6) Hub buttons → navigate to other pages
  // ------------------------------
  document.getElementById("btnLeaderboard").addEventListener("click", function () {
    window.location.href = "leaderboard.html";
  });
  document.getElementById("btnCasefile").addEventListener("click", function () {
    window.location.href = "casefile.html";
  });
  document.getElementById("btnWellnessQuests").addEventListener("click", function () {
    window.location.href = "wellness.html";
  });
})();
