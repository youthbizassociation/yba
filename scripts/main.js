const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = document.querySelectorAll(".reveal");
const joinForm = document.getElementById("join-form");
const joinFirstName = document.getElementById("join-first-name");
const joinLastName = document.getElementById("join-last-name");
const joinGrade = document.getElementById("join-grade");
const joinSchool = document.getElementById("join-school");
const joinState = document.getElementById("join-state");
const joinEmail = document.getElementById("join-email");
const joinStatus = document.getElementById("join-status");
const joinReferralNote = document.getElementById("join-referral-note");
const joinButton = joinForm ? joinForm.querySelector("button") : null;
const copyrightYear = document.getElementById("copyright-year");
const pageKey = document.body.dataset.page || "home";
const formConfig = window.YBA_FORM_CONFIG || null;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const searchParams = new URLSearchParams(window.location.search);
const referralName = (searchParams.get("ref_name") || "").trim();
const referralEmail = (searchParams.get("ref_email") || "").trim().toLowerCase();
const referralEmailIsValid = emailPattern.test(referralEmail);
const referralActive = Boolean(referralName && referralEmailIsValid);



if (copyrightYear) {
  copyrightYear.textContent = String(new Date().getFullYear());
}

if (joinReferralNote) {
  joinReferralNote.hidden = !referralActive;
  if (referralActive) {
    joinReferralNote.textContent = `You were invited by ${referralName}. When you sign up, they will receive your submitted join information.`;
  }
}

// Navigation
if (navToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      if (window.innerWidth <= 900) closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("open")) return;
    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// Current page highlighting
const activeMap = {
  home: "index.html",
  about: "about.html",
  events: "events.html",
  join: "join.html",
  discord: "discord.html",
  socials: "socials.html",
  privacy: "privacy.html"
};

const activeHref = activeMap[pageKey];
if (activeHref) {
  navAnchors.forEach((anchor) => {
    const isActive = anchor.getAttribute("href") === activeHref;
    anchor.classList.toggle("is-active", isActive);
    if (isActive) {
      anchor.setAttribute("aria-current", "page");
    } else {
      anchor.removeAttribute("aria-current");
    }
  });
}

// Scroll reveal animations
if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Staggered card animations
document.querySelectorAll(".impact-cards .impact-card, .feature-grid .feature-card").forEach((element, index) => {
  element.style.transitionDelay = `${index * 0.08}s`;
});

// Join form helpers
const setStatus = (message, type) => {
  if (!joinStatus) return;
  joinStatus.textContent = message;
  joinStatus.classList.toggle("is-error", type === "error");
  joinStatus.classList.toggle("is-success", type === "success");
};

// Join form submission
if (joinForm && joinFirstName && joinLastName && joinGrade && joinSchool && joinState && joinEmail && joinButton) {
  joinForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = joinFirstName.value.trim();
    const lastName = joinLastName.value.trim();
    const grade = joinGrade.value.trim();
    const school = joinSchool.value.trim();
    const state = joinState.value;
    const email = joinEmail.value.trim().toLowerCase();
    const emailIsValid = emailPattern.test(email);

    joinFirstName.setAttribute("aria-invalid", String(!firstName));
    joinLastName.setAttribute("aria-invalid", String(!lastName));
    joinGrade.setAttribute("aria-invalid", String(!grade));
    joinSchool.setAttribute("aria-invalid", String(!school));
    joinState.setAttribute("aria-invalid", String(!state));
    joinEmail.setAttribute("aria-invalid", String(!emailIsValid));

    if (!firstName) { setStatus("Please enter your first name.", "error"); joinFirstName.focus(); return; }
    if (!lastName) { setStatus("Please enter your last name.", "error"); joinLastName.focus(); return; }
    if (!grade) { setStatus("Please enter your grade.", "error"); joinGrade.focus(); return; }
    if (!school) { setStatus("Please enter your school.", "error"); joinSchool.focus(); return; }
    if (!state) { setStatus("Please select your state.", "error"); joinState.focus(); return; }
    if (!emailIsValid) { setStatus("Please enter a valid email address.", "error"); joinEmail.focus(); return; }

    joinButton.disabled = true;
    joinButton.textContent = "Submitting...";

    try {
      const submitUrl = formConfig && formConfig.submitUrl && !formConfig.submitUrl.startsWith("YOUR_")
        ? formConfig.submitUrl
        : null;

      if (!submitUrl) {
        throw new Error("Form signup is not configured yet. Please try again later.");
      }

      const payload = {
        first_name: firstName,
        last_name: lastName,
        grade,
        school,
        state,
        email,
        referral_name: referralActive ? referralName : "",
        referral_email: referralActive ? referralEmail : ""
      };

      const response = await fetch(submitUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });

      joinForm.reset();
      joinFirstName.setAttribute("aria-invalid", "false");
      joinLastName.setAttribute("aria-invalid", "false");
      joinGrade.setAttribute("aria-invalid", "false");
      joinSchool.setAttribute("aria-invalid", "false");
      joinState.setAttribute("aria-invalid", "false");
      joinEmail.setAttribute("aria-invalid", "false");
      setStatus("You're all set! Your info has been submitted. We'll be in touch soon.", "success");
    } catch (error) {
      setStatus(error.message || "We could not process your signup right now. Please try again.", "error");
    } finally {
      joinButton.disabled = false;
      joinButton.textContent = "Join for Free →";
    }
  });

  const clearJoinError = () => {
    if (joinStatus && joinStatus.textContent) setStatus("", "");
  };

  [joinFirstName, joinLastName, joinGrade, joinSchool, joinState, joinEmail].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", () => {
      field.setAttribute("aria-invalid", "false");
      clearJoinError();
    });
  });
}
