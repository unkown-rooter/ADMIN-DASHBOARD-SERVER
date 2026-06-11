/* =================================================================
*************************DOM ELEMENTS***************************
================================================================= */
document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "http://localhost:5000/api";

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const messageBox = document.getElementById("messageBox");
    const loadingSpinner = document.getElementById("loadingSpinner");

    const googleLoginBtn = document.getElementById("googleLoginBtn");
    const facebookLoginBtn = document.getElementById("facebookLoginBtn");
    const githubLoginBtn = document.getElementById("githubLoginBtn");

    /*const registerLink = document.getElementById("registerLink");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");*/

/* =================================================================
*************************LOADING SYSTEM***************************
================================================================= */
    function showLoading() {
        toggleLoading(true);
    }

    function hideLoading() {
        toggleLoading(false);
    }

    function toggleLoading(show) {

        if (loadingSpinner) {
            loadingSpinner.style.display = show ? "block" : "none";
        }

        if (loginBtn) {
            loginBtn.disabled = show;

            loginBtn.innerHTML = show
                ? `<i class="fa-solid fa-spinner fa-spin"></i> Logging In...`
                : `Login`;
        }
    }

/* =================================================================
*************************SINGLE LOGIN FUNCTION***************************
================================================================= */
        async function loginUser(email, password) {

        try {
            showLoading();

            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            localStorage.setItem("token", data.token);
            localStorage.setItem("admin", JSON.stringify(data.admin));

            showMessage("Login successful", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);

        } catch (err) {
            showMessage(err.message || "Login failed", "error");

        } finally {
            hideLoading();
        }
    }

/* =================================================================
*************************FORM EVENTS***************************
================================================================= */
        if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showMessage("Please fill all fields", "error");
                return;
            }

            loginUser(email, password);
        });
    }
/* =================================================================
*************************MESSAGE SYSTEM***************************
===================================================================*/
        function showMessage(message, type) {

        if (!messageBox) return;

        messageBox.textContent = message;

        messageBox.classList.remove("success-message", "error-message");

        if (!message) return;

        messageBox.classList.add(
            type === "success" ? "success-message" : "error-message"
        );
    }
/* =================================================================
**************************AUTO-LOGIN CHECK***************************
================================================================= */
            const token = localStorage.getItem("token");

    if (token) {
        window.location.href = "index.html";
    }
});