//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
/* index.html – login/register page
 *
 * Uses:
 * - currentUrl (from getCurrentURL.js)
 * - fetchMethod (from queryCmds.js) to call /api/login and /api/register
 */
document.addEventListener("DOMContentLoaded", () => {
  // Panels and buttons for switching between Login / Register
  const loginBox = document.getElementById("loginBox");
  const registerBox = document.getElementById("registerBox");

  const showLoginBtn = document.getElementById("showLoginBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");

  // Warning message block shown above forms
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  // The two forms
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Simple helpers to show/hide error banner
  function showWarning(message) {
    warningText.innerText = message || "Something went wrong.";
    warningCard.classList.remove("d-none");
  }

  function hideWarning() {
    warningText.innerText = "";
    warningCard.classList.add("d-none");
  }

  // Toggle view → Login tab visible
  function showLogin() {
    hideWarning();
    loginBox.classList.remove("d-none");
    registerBox.classList.add("d-none");
    showLoginBtn.classList.replace("btn-secondary", "btn-primary");
    showRegisterBtn.classList.replace("btn-primary", "btn-secondary");
  }

  // Toggle view → Register tab visible
  function showRegister() {
    hideWarning();
    registerBox.classList.remove("d-none");
    loginBox.classList.add("d-none");
    showRegisterBtn.classList.replace("btn-secondary", "btn-primary");
    showLoginBtn.classList.replace("btn-primary", "btn-secondary");
  }

  showLoginBtn.addEventListener("click", showLogin);
  showRegisterBtn.addEventListener("click", showRegister);

  // Disable/enable a form's submit button while request is in-flight
  function setSubmitting(form, isSubmitting) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = isSubmitting;
  }

  // ------------------------------
  // LOGIN handler
  // ------------------------------
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideWarning();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
      showWarning("Username and password are required.");
      return;
    }

    setSubmitting(loginForm, true);

    const callback = (status, data) => {
      // Success → save token and go to home
      if ((status === 200 || status === 201) && data && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "home.html";
        return;
      }
      // Network issues (e.g. server offline)
      if (status === 0) {
        showWarning("Network error. Please try again.");
      } else {
        // Backend responded but not OK
        showWarning((data && data.message) || "Login failed.");
      }
      setSubmitting(loginForm, false);
    };

    fetchMethod(
      currentUrl + "/api/login",
      callback,
      "POST",
      { username, password },
      null
    );
  });

  // ------------------------------
  // REGISTER handler
  // ------------------------------
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideWarning();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
      showWarning("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      showWarning("Passwords do not match.");
      return;
    }

    setSubmitting(registerForm, true);

    const callback = (status, data) => {
      if ((status === 200 || status === 201) && data && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "home.html";
        return;
      }
      if (status === 0) {
        showWarning("Network error. Please try again.");
      } else {
        showWarning((data && data.message) || "Registration failed.");
      }
      setSubmitting(registerForm, false);
    };

    fetchMethod(
      currentUrl + "/api/register",
      callback,
      "POST",
      { username, email, password },
      null
    );
  });

  // Default view
  showLogin();
});
