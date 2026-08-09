const form = document.getElementById("contactForm");
const input = document.getElementById("contactInput");
const status = document.getElementById("formStatus");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const looksLikePhone = /^[+()\d\s-]{7,}$/.test(value);

  if (!looksLikeEmail && !looksLikePhone) {
    status.textContent = "Укажите корректный телефон или email.";
    status.style.color = "#ff9b9b";
    input.focus();
    return;
  }

  // Демонстрационный режим. Для реальной отправки подключите backend,
  // Formspree, Telegram Bot API или другой сервис обработки формы.
  status.textContent = "Заявка подготовлена. Подключите обработчик формы для реальной отправки.";
  status.style.color = "#a6ffcc";
  form.reset();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


const revealTargets = document.querySelectorAll(
  ".process-card, .problem, .result-card, .section-heading, .contact-form"
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
      const dx = (event.clientX / window.innerWidth - .5) * 8;
      const dy = (event.clientY / window.innerHeight - .5) * 8;
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

    progress.style.height = `${Math.min(percent * 1.15, 100)}%`;

    steps.forEach((step, index) => {
      const stepRect = step.getBoundingClientRect();
      const active = stepRect.top < viewportPoint && stepRect.bottom > window.innerHeight * 0.18;
      step.classList.toggle("is-active", active || stepRect.top < viewportPoint - 80);
    });

    if (rect.bottom < viewportPoint + 80) {
      finish.classList.add("is-active");
    } else {
      finish.classList.remove("is-active");
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