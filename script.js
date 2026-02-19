const FORM_ENDPOINT = "https://YOUR_WORKER_SUBDOMAIN.workers.dev/contact";

(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("primary-nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  const closeMenu = () => {
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      document.body.classList.toggle("nav-open", !expanded);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const currentPage = document.body.dataset.page || "";
  const active = nav ? nav.querySelector(`[data-nav="${currentPage}"]`) : null;
  if (active) active.setAttribute("aria-current", "page");

  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  if (revealNodes.length) {
    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealNodes.forEach((node) => observer.observe(node));
    }
  }

  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  const fallbackEmail = document.body.dataset.email || "";
  const businessName = document.body.dataset.business || "Business";

  if (form && status) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        business: businessName,
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        page: window.location.href
      };

      status.textContent = "Sending your message...";
      status.classList.remove("error");
      status.classList.add("visible");

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Request failed");

        status.textContent = "Thanks. Your message was sent.";
        form.reset();
      } catch (error) {
        status.classList.add("error");
        status.innerHTML = fallbackEmail
          ? `Unable to send right now. You can also email us directly at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`
          : "Unable to send right now. Please call or email directly.";
      }
    });
  }
})();