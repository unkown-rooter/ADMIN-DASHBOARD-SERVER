// lets add 



/* =========================================================
   REGISTER SYSTEM (FRONTEND → BACKEND READY + OAUTH)
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   FORM ELEMENTS
========================================================= */

const registerForm = document.getElementById("registerForm");

const nameInput = document.getElementById("name");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const confirmPasswordInput = document.getElementById("confirmPassword");


/* =========================================================
   SOCIAL LOGIN ELEMENTS (NEW)
========================================================= */

const googleSignupBtn = document.getElementById("googleSignupBtn");

const facebookSignupBtn = document.getElementById("facebookSignupBtn");

const githubSignupBtn = document.getElementById("githubSignupBtn");
/* =========================================================
   MANUAL REGISTER (YOUR ORIGINAL LOGIC - KEPT)
========================================================= */

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    // ================================
    // VALIDATION
    // ================================
    
    if (passwordInput.value !== confirmPasswordInput.value) {

        alert("Passwords do not match ❌");

        return;
        // disappear after 5 seconds
        const timer = setTimeout(() => {
            alert.style.display = "none";
            clearTimeout(timer);
        })
    }

    // ================================
    // PAYLOAD
    // ================================

    const data = {

        name: nameInput.value,

        email: emailInput.value || nameInput.value,

        password: passwordInput.value

    };


    try {

        const res = await fetch(`${API_BASE_URL}/auth/register`, {

            method: "POST", // this is a post request, we use it here to register our user to the database

            headers: {
                "Content-Type": "application/json" // this is the type of data we are sending
            },

            body: JSON.stringify(data) // we need to stringify the data before sending it to the backend

        });


        const result = await res.json();// this is the response from the backend


        if (res.ok) { // if the response is ok, we can proceed

            localStorage.setItem("token", result.token);// we set the token in local storgae

            showSuccess("Account created 🚀");// after setting token in local account, we show a success message 

            window.location.href = "index.html"; // and redirect the user to the index page

        } else { // if the response is not ok, we show an error message       

            showError(result.message || "Registration failed");

        }


    } catch (err) { // if there is an error, we log it to the console

        console.error("Register Error:", err);

    }

});

/* =========================================================
    SETTINGS SAVE (NEW)
========================================================= */
document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    const payload = {
        defaultPrefix: document.getElementById("defaultPrefix").value,
        logLevel: document.getElementById("logLevelSelect").value,
        telegramToken: document.getElementById("telegramToken").value,
        whatsappKey: document.getElementById("whatsappKey").value,
        autoRestart: document.getElementById("autoRestart").checked,
        enableLogs: document.getElementById("enableLogs").checked 
    };

    try {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok) {
            showSuccess("Settings saved ✅");
        } else {
            showError(result.message || "Settings save failed");
        }
    } catch (err) {
        console.error("Settings Error:", err);
    }
});

// adding redirect to login page if user is already logged in
if (localStorage.getItem("token")) {
    window.location.href = "index.html";
} // user is not logged in, we stay on the register page


/* =========================================================
    LOGOUT (NEW)
========================================================= */
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    showSuccess("Logged out successfully");
    window.location.href = "register.html";
});



/* =========================================================
   GOOGLE SIGNUP (NEW)
========================================================= */

if (googleSignupBtn) {

    googleSignupBtn.addEventListener("click", () => {

        // Backend OAuth route
        // This will automatically:
        // 1. Redirect to Google
        // 2. Create user if not exists
        // 3. Return JWT

        window.location.href = `${API_BASE_URL}/auth/google`;

    });

}


/* =========================================================
   FACEBOOK SIGNUP (NEW)
========================================================= */

if (facebookSignupBtn) {

    facebookSignupBtn.addEventListener("click", () => {

        // Backend OAuth route
        // Same flow as Google

        window.location.href = `${API_BASE_URL}/auth/facebook`;

    });

}

/* =========================================================
   GITHUB SIGNUP (NEW)
========================================================= */

if (githubSignupBtn) {

    githubSignupBtn.addEventListener("click", () => {

        // Backend OAuth route
        // Same flow as Google

        window.location.href = `${API_BASE_URL}/auth/github`;

    });

}

/* =========================================================
   SUCCESS MESSAGE
========================================================= */
/**
 * 
 * @param {*} message // * is a wildcard, it means that the message can be of any type (string, number, object, etc.)
 */
function showSuccess(message) { // show success message
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 3000);
}
