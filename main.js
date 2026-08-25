/* ==========================================================================
   IMG DEV. — site behaviour
   Everything here is progressive enhancement: the site works with JS disabled.
   ========================================================================== */

(function () {
    "use strict";

    var STORAGE_KEY = "imgdev-theme";

    /* ---------------------------------------------------------------- theme */

    var toggle = document.getElementById("theme-toggle");

    if (toggle) {
        toggle.addEventListener("click", function () {
            var current = document.documentElement.getAttribute("data-theme");
            var next = current === "light" ? "dark" : "light";

            document.documentElement.setAttribute("data-theme", next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) {
                /* storage blocked — the theme still applies for this page view */
            }
        });
    }

    /* ----------------------------------------------------------------- year */

    var year = document.getElementById("year");
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    /* ----------------------------------------------------------------- form */

    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    var submit = document.getElementById("form-submit");

    if (!form || !status || !submit || typeof window.fetch !== "function") {
        // Without fetch the form falls back to a normal POST, which Formspree
        // handles by redirecting to its own confirmation page. Still works.
        return;
    }

    function setStatus(message, kind) {
        status.textContent = message;
        status.className = "form__status form__status--" + kind;
        status.hidden = false;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        status.hidden = true;
        submit.disabled = true;
        submit.textContent = "Sending…";

        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
        })
            .then(function (response) {
                if (response.ok) {
                    form.reset();
                    setStatus("Message sent. Thanks — I'll get back to you soon.", "ok");
                    return;
                }
                return response.json().then(
                    function (data) {
                        var detail = data && data.errors
                            ? data.errors.map(function (e) { return e.message; }).join(", ")
                            : "Something went wrong.";
                        setStatus(
                            detail + " You can also email contact@img-dev.io directly.",
                            "error"
                        );
                    },
                    function () {
                        setStatus(
                            "Something went wrong. Please email contact@img-dev.io directly.",
                            "error"
                        );
                    }
                );
            })
            .catch(function () {
                setStatus(
                    "Network error — please email contact@img-dev.io directly.",
                    "error"
                );
            })
            .then(function () {
                submit.disabled = false;
                submit.textContent = "Send message";
            });
    });
})();
