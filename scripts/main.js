const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = document.querySelectorAll(".reveal");
const joinForm = document.getElementById("join-form");
const joinEmail = document.getElementById("join-email");
const joinStatus = document.getElementById("join-status");
const joinButton = joinForm ? joinForm.querySelector("button") : null;
const donationConfig = window.YBA_DONATION_CONFIG || null;
const donationOneTimeLink = document.getElementById("donation-one-time-link");
const donationMonthlyLink = document.getElementById("donation-monthly-link");
const donationStatus = document.getElementById("donation-status");
const copyrightYear = document.getElementById("copyright-year");
const pageKey = document.body.dataset.page || "home";
const emailConfig = window.YBA_EMAIL_CONFIG || null;

if (window.emailjs && emailConfig && emailConfig.publicKey && !emailConfig.publicKey.startsWith("YOUR_")) {
  window.emailjs.init({
    publicKey: emailConfig.publicKey
  });
}

if (copyrightYear) {
  copyrightYear.textContent = String(new Date().getFullYear());
}

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
      if (window.innerWidth <= 900) {
        closeMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("open")) {
      return;
    }

    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const activeMap = {
  about: "about.html",
  programs: "programs.html",
  events: "events.html",
  impact: "impact.html",
  donate: "donate.html",
  join: "join.html"
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

if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

document.querySelectorAll(".programs-grid .program-card, .impact-cards .impact-card, .feature-grid .feature-card").forEach((element, index) => {
  element.style.transitionDelay = `${index * 0.08}s`;
});

const setStatus = (message, type) => {
  if (!joinStatus) {
    return;
  }

  joinStatus.textContent = message;
  joinStatus.classList.toggle("is-error", type === "error");
  joinStatus.classList.toggle("is-success", type === "success");
};

const setDonationStatus = (message, type) => {
  if (!donationStatus) {
    return;
  }

  donationStatus.textContent = message;
  donationStatus.classList.toggle("is-error", type === "error");
  donationStatus.classList.toggle("is-success", type === "success");
};

if (donationOneTimeLink || donationMonthlyLink) {
  const oneTimeUrl = donationConfig && typeof donationConfig.oneTimeUrl === "string" ? donationConfig.oneTimeUrl.trim() : "";
  const monthlyUrl = donationConfig && typeof donationConfig.monthlyUrl === "string" ? donationConfig.monthlyUrl.trim() : "";
  const platformName = donationConfig && donationConfig.platformName ? donationConfig.platformName : "your payment provider";
  const configuredOneTime = oneTimeUrl && !oneTimeUrl.startsWith("YOUR_");
  const configuredMonthly = monthlyUrl && !monthlyUrl.startsWith("YOUR_");

  if (donationOneTimeLink && configuredOneTime) {
    donationOneTimeLink.href = oneTimeUrl;
    donationOneTimeLink.setAttribute("target", "_blank");
    donationOneTimeLink.setAttribute("rel", "noopener noreferrer");
  }

  if (donationMonthlyLink) {
    const monthlyHref = configuredMonthly ? monthlyUrl : (configuredOneTime ? oneTimeUrl : donationMonthlyLink.getAttribute("href"));
    donationMonthlyLink.href = monthlyHref;
    donationMonthlyLink.setAttribute("target", "_blank");
    donationMonthlyLink.setAttribute("rel", "noopener noreferrer");
  }

  if (configuredOneTime) {
    const monthlyMessage = configuredMonthly ? " One-time and monthly donations are ready." : " Monthly donations currently use the same donation page.";
    setDonationStatus(`Secure online giving is active through ${platformName}.${monthlyMessage}`, "success");
  } else {
    setDonationStatus("Add your payment links in scripts/donation-config.js to accept online donations on this page.", "error");
  }
}

if (joinForm && joinEmail && joinButton) {
  joinForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = joinEmail.value.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    joinEmail.setAttribute("aria-invalid", String(!emailIsValid));

    if (!emailIsValid) {
      setStatus("Please enter a valid email address to join the association.", "error");
      joinEmail.focus();
      return;
    }

    joinButton.disabled = true;
    joinButton.textContent = "Submitting...";

    try {
      const emailJsReady = Boolean(
        window.emailjs &&
        emailConfig &&
        emailConfig.publicKey &&
        emailConfig.serviceId &&
        emailConfig.adminTemplateId &&
        emailConfig.welcomeTemplateId &&
        !emailConfig.publicKey.startsWith("YOUR_") &&
        !emailConfig.serviceId.startsWith("YOUR_") &&
        !emailConfig.adminTemplateId.startsWith("YOUR_") &&
        !emailConfig.welcomeTemplateId.startsWith("YOUR_")
      );

      if (!emailJsReady) {
        throw new Error("Email signup is not configured yet.");
      }

      const submittedAt = new Date().toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short"
      });

      const [adminResult, welcomeResult] = await Promise.all([
        window.emailjs.send(emailConfig.serviceId, emailConfig.adminTemplateId, {
          admin_email: emailConfig.adminEmail || "youthbusinessassociation@outlook.com",
          reply_to: email,
          user_email: email,
          submitted_at: submittedAt
        }),
        window.emailjs.send(emailConfig.serviceId, emailConfig.welcomeTemplateId, {
          user_email: email
        })
      ]);

      if (adminResult.status !== 200 || welcomeResult.status !== 200) {
        throw new Error("We could not send your signup email right now. Please try again.");
      }

      joinForm.reset();
      joinEmail.setAttribute("aria-invalid", "false");
      setStatus("You are all set. Please check your inbox for a welcome email.", "success");
    } catch (error) {
      setStatus(error.message || "We could not process your signup right now. Please try again.", "error");
    } finally {
      joinButton.disabled = false;
      joinButton.textContent = "Join for Free ->";
    }
  });

  joinEmail.addEventListener("input", () => {
    joinEmail.setAttribute("aria-invalid", "false");
    if (joinStatus && joinStatus.textContent) {
      setStatus("", "");
    }
  });
}
