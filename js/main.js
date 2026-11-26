document.documentElement.classList.add("js");

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TITLES = {
  en: "Hytale",
  ar: "Hytale",
};

function applyLanguage(lang) {
  const dictionary = TRANSLATIONS[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = TITLES[lang];
  $("#lang").textContent = lang === "ar" ? "EN" : "AR";

  $$("[data-i]").forEach((element) => {
    const text = dictionary[element.dataset.i];
    if (text !== undefined) element.textContent = text;
  });

  try {
    localStorage.setItem("lang", lang);
  } catch (error) {}
}

function detectLanguage() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch (error) {}
  return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
}

function initLanguage() {
  let lang = detectLanguage();
  applyLanguage(lang);

  $("#lang").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    applyLanguage(lang);
  });
}

function showVersion(version) {
  $$(".js-ver").forEach((element) => {
    element.textContent = version;
  });
}

function loadLatestVersion() {
  showVersion(CONFIG.fallbackVersion);

  fetch(`${CONFIG.versionUrl}?t=${Date.now()}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data && data.version) showVersion(String(data.version).replace(/^v/i, ""));
    })
    .catch(() => {});
}

function startDownload() {
  const link = document.createElement("a");
  link.href = CONFIG.downloadUrl;
  link.download = "HytaleLauncher.exe";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function goTo(selector) {
  if (selector === "#top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const target = $(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: selector === "#download" ? "center" : "start" });
}

function activateLink(element) {
  if (element.dataset.go) {
    goTo(element.dataset.go);
  } else if (element.dataset.download !== undefined) {
    startDownload();
  } else if (element.dataset.open) {
    const url = CONFIG[element.dataset.open];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }
}

function initLinks() {
  $$("[data-go], [data-download], [data-open]").forEach((element) => {
    if (element.dataset.open && !CONFIG[element.dataset.open]) {
      element.hidden = true;
      return;
    }

    element.setAttribute("role", element.classList.contains("hy-btn") ? "button" : "link");
    element.tabIndex = 0;

    element.addEventListener("click", (event) => {
      event.preventDefault();
      activateLink(element);
    });

    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateLink(element);
    });
  });
}

function initNavigation() {
  const nav = $("#nav");
  const progress = $("#progress");
  let ticking = false;

  const update = () => {
    const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", scrolled > 24);
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrolled / max, 1) : 0})`;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

function initRevealOnScroll() {
  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach((element) => element.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  $$(".reveal").forEach((element) => observer.observe(element));
}

function initCardSpotlight() {
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

function initMotes(count = 26) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const container = $("#motes");
  for (let i = 0; i < count; i++) {
    const mote = document.createElement("i");
    const size = 3 + Math.random() * 7;

    mote.style.left = `${Math.random() * 100}%`;
    mote.style.width = `${size}px`;
    mote.style.height = `${size}px`;
    mote.style.animationDuration = `${9 + Math.random() * 12}s`;
    mote.style.animationDelay = `${-Math.random() * 20}s`;
    mote.style.setProperty("--dx", `${Math.round(Math.random() * 160 - 80)}px`);
    container.appendChild(mote);
  }
}

initLanguage();
initLinks();
loadLatestVersion();
initNavigation();
initRevealOnScroll();
initCardSpotlight();
initMotes(window.innerWidth < 700 ? 10 : 26);
