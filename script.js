const WORKER_URL = "https://business-contact.slackpadbull.workers.dev/";

const form = document.getElementById("contactForm");
const input = document.getElementById("contactInput");
const messageInput = form?.querySelector('textarea[name="message"]');
const status = document.getElementById("formStatus");

if (form && input && status) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const contact = input.value.trim();
    const message = messageInput ? messageInput.value.trim() : "";

    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikePhone = /^[+()\d\s-]{7,}$/.test(contact);

    if (!looksLikeEmail && !looksLikePhone) {
      status.textContent = "Укажите корректный телефон или email.";
      status.style.color = "#ff9b9b";
      input.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "Отправить заявку";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Отправляем…";
    }

    status.textContent = "";

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, message })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Worker returned an unsuccessful response");
      }

      status.textContent = "Заявка отправлена. Свяжемся с вами в ближайшее время.";
      status.style.color = "#a6ffcc";
      form.reset();
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      status.style.color = "#ff9b9b";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealTargets = document.querySelectorAll(
  ".process-step, .problem, .result-card, .section-heading, .contact-form"
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealTargets.forEach((el, index) => {
  el.classList.add("reveal");
  el.style.setProperty("--delay", `${Math.min(index * 70, 350)}ms`);
  revealObserver.observe(el);
});

if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;

    document.documentElement.style.setProperty("--mx", `${x}%`);
    document.documentElement.style.setProperty("--my", `${y}%`);

    const preview = document.querySelector(".hero-preview");
    if (preview) {
      const dx = (event.clientX / window.innerWidth - 0.5) * 8;
      const dy = (event.clientY / window.innerHeight - 0.5) * 8;
      preview.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }, { passive: true });
}

const style = document.createElement("style");
style.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(35px);
    transition:
      opacity .75s cubic-bezier(.2,.8,.2,1) var(--delay),
      transform .75s cubic-bezier(.2,.8,.2,1) var(--delay);
  }
  .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .contact-form button[disabled] {
    opacity: .65;
    cursor: wait;
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; transform: none; }
  }
`;
document.head.appendChild(style);

const processTimeline = document.getElementById("processTimeline");

if (processTimeline) {
  const steps = [...processTimeline.querySelectorAll(".process-step")];
  const progress = processTimeline.querySelector(".timeline-progress span");
  const finish = processTimeline.querySelector(".timeline-finish");

  const updateTimeline = () => {
    const rect = processTimeline.getBoundingClientRect();
    const viewportPoint = window.innerHeight * 0.58;
    const total = rect.height;
    const passed = Math.max(0, Math.min(total, viewportPoint - rect.top));
    const percent = (passed / total) * 100;

    if (progress) {
      progress.style.height = `${Math.min(percent * 1.15, 100)}%`;
    }

    steps.forEach((step) => {
      const stepRect = step.getBoundingClientRect();
      const active =
        stepRect.top < viewportPoint &&
        stepRect.bottom > window.innerHeight * 0.18;

      step.classList.toggle(
        "is-active",
        active || stepRect.top < viewportPoint - 80
      );
    });

    if (finish) {
      finish.classList.toggle("is-active", rect.bottom < viewportPoint + 80);
    }
  };

  let timelineTick = false;

  window.addEventListener("scroll", () => {
    if (timelineTick) return;
    timelineTick = true;
    requestAnimationFrame(() => {
      updateTimeline();
      timelineTick = false;
    });
  }, { passive: true });

  window.addEventListener("resize", updateTimeline);
  updateTimeline();
}
