'use strict';

/**
 * motion layer: intro, scroll reveal, project filter, card spotlight,
 * custom cursor, scrollspy and magnetic buttons.
 * Everything here is progressive: without this file the page is static.
 */

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;



/**
 * hero intro
 */

const heroTitle = document.querySelector(".hero-title");

if (heroTitle) {
  heroTitle.setAttribute("aria-label", heroTitle.textContent.trim());

  const words = heroTitle.textContent.trim().split(/\s+/);
  heroTitle.textContent = "";

  words.forEach(function (word, i) {
    const outer = document.createElement("span");
    const inner = document.createElement("span");
    outer.className = "split-word";
    outer.setAttribute("aria-hidden", "true");
    outer.style.setProperty("--w", i);
    inner.className = "split-inner";
    inner.textContent = word;
    outer.appendChild(inner);
    heroTitle.appendChild(outer);
    if (i < words.length - 1) heroTitle.appendChild(document.createTextNode(" "));
  });
}

const introItems = document.querySelectorAll(
  ".header .logo, .header .navbar-list > li, .hero-content > .section-subtitle, .hero-text, .hero-list > li, .exp-list > li, .slide-down-btn"
);

introItems.forEach(function (elem, i) {
  elem.classList.add("intro-item");
  elem.style.setProperty("--i", i);
});

const startIntro = function () {
  requestAnimationFrame(function () { root.classList.add("is-loaded"); });
}

if (document.readyState === "complete") startIntro();
else window.addEventListener("load", startIntro);

// never leave the hero hidden if an image is slow
setTimeout(startIntro, 1500);



/**
 * count up numbers in the hero stats ("2+" -> counts 0..2)
 */

const countElems = document.querySelectorAll(".exp-list .strong");

countElems.forEach(function (elem) {
  const match = elem.textContent.match(/^(\d+)(.*)$/);
  if (!match || reduceMotion) return;

  const target = parseInt(match[1], 10);
  const suffix = match[2];
  const duration = 1400;
  let start = null;

  elem.textContent = "0" + suffix;

  const tick = function (time) {
    if (start === null) start = time;
    const t = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    elem.textContent = Math.round(eased * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }

  setTimeout(function () { requestAnimationFrame(tick); }, 700);
});



/**
 * scroll reveal
 */

const revealGroups = [
  ".section:not(.hero) .section-subtitle",
  ".section:not(.hero) .section-title",
  ".section:not(.hero) .section-text",
  ".project-list > li",
  ".gallery-item",
  ".skills-item",
  ".timeline-item",
  ".contact-item",
  ".submit-btn"
];

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" })
  : null;

if (revealObserver && !reduceMotion) {
  revealGroups.forEach(function (selector) {
    // stagger siblings that share a parent
    const seen = new Map();

    document.querySelectorAll(selector).forEach(function (elem) {
      const index = seen.get(elem.parentElement) || 0;
      seen.set(elem.parentElement, index + 1);
      elem.classList.add("reveal");
      elem.style.setProperty("--i", Math.min(index, 5));
      revealObserver.observe(elem);
    });
  });
}



/**
 * scroll-driven: progress bar, hero parallax, timeline track
 */

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.appendChild(progressBar);

const heroImg = document.querySelector(".hero-banner .img-cover");
const timelineList = document.querySelector(".timeline-list");

if (timelineList) timelineList.classList.add("has-track");

let scrollTicking = false;

const onScroll = function () {
  const maxScroll = root.scrollHeight - window.innerHeight;
  progressBar.style.setProperty("--progress", maxScroll > 0 ? window.scrollY / maxScroll : 0);

  if (!reduceMotion && heroImg && window.scrollY < window.innerHeight * 1.5) {
    heroImg.style.setProperty("--parallax", (window.scrollY * 0.12).toFixed(1) + "px");
  }

  if (timelineList) {
    const rect = timelineList.getBoundingClientRect();
    const passed = (window.innerHeight * 0.75 - rect.top) / rect.height;
    timelineList.style.setProperty("--track", Math.max(0, Math.min(1, passed)).toFixed(3));
  }

  scrollTicking = false;
}

window.addEventListener("scroll", function () {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(onScroll);
}, { passive: true });

window.addEventListener("resize", onScroll);
onScroll();



/**
 * nav scrollspy
 */

const spyLinks = document.querySelectorAll("[data-nav-link]");

if ("IntersectionObserver" in window && spyLinks.length) {
  const linkFor = new Map();

  spyLinks.forEach(function (link) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) linkFor.set(section, link);
  });

  const spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      spyLinks.forEach(function (link) { link.classList.remove("is-current"); });
      linkFor.get(entry.target).classList.add("is-current");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  linkFor.forEach(function (link, section) { spyObserver.observe(section); });
}



/**
 * project filter (grouped by organisation in .card-meta), animated with FLIP
 */

const projectList = document.querySelector("#projects .project-list");

if (projectList) {
  const items = Array.from(projectList.children);
  const groupOf = function (item) {
    const meta = item.querySelector(".card-meta");
    return meta ? meta.textContent.split("·")[0].trim() : "";
  }

  const groups = [];
  items.forEach(function (item) {
    const group = groupOf(item);
    item.dataset.group = group;
    if (group && !groups.includes(group)) groups.push(group);
  });

  if (groups.length > 1 && items.length > 3) {
    const bar = document.createElement("div");
    bar.className = "project-filter";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter projects");

    ["All"].concat(groups).forEach(function (label, i) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (i === 0 ? " active" : "");
      btn.textContent = label;
      btn.dataset.filter = i === 0 ? "*" : label;
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      bar.appendChild(btn);
    });

    projectList.parentElement.insertBefore(bar, projectList);

    const applyFilter = function (filter) {
      const first = new Map();
      items.forEach(function (item) {
        if (!item.classList.contains("is-hidden")) first.set(item, item.getBoundingClientRect());
      });

      items.forEach(function (item) {
        const show = filter === "*" || item.dataset.group === filter;
        item.classList.toggle("is-hidden", !show);
      });

      if (reduceMotion) return;

      items.forEach(function (item) {
        if (item.classList.contains("is-hidden")) return;
        const last = item.getBoundingClientRect();
        const prev = first.get(item);
        const anim = prev
          ? [{ transform: "translate(" + (prev.left - last.left) + "px," + (prev.top - last.top) + "px)" }, { transform: "none" }]
          : [{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }];
        item.animate(anim, { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      });
    }

    bar.addEventListener("click", function (event) {
      const btn = event.target.closest(".filter-btn");
      if (!btn || btn.classList.contains("active")) return;

      bar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });

      applyFilter(btn.dataset.filter);
    });
  }
}



/**
 * card spotlight + tilt (pointer devices only)
 */

if (finePointer) {
  document.querySelectorAll(".project-card").forEach(function (card) {
    card.classList.add("has-spotlight");

    card.addEventListener("pointermove", function (event) {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");

      if (!reduceMotion) {
        card.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
      }
    });

    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}



/**
 * magnetic buttons
 */

if (finePointer && !reduceMotion) {
  document.querySelectorAll(".submit-btn, .slide-down-btn, .social-link").forEach(function (elem) {
    elem.classList.add("magnetic");

    elem.addEventListener("pointermove", function (event) {
      const rect = elem.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      elem.style.setProperty("--tx", (dx * 0.3).toFixed(1) + "px");
      elem.style.setProperty("--ty", (dy * 0.3).toFixed(1) + "px");
    });

    elem.addEventListener("pointerleave", function () {
      elem.style.setProperty("--tx", "0px");
      elem.style.setProperty("--ty", "0px");
    });
  });
}



/**
 * custom cursor: dot follows instantly, ring trails with easing
 */

if (finePointer && !reduceMotion) {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(dot, ring);

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, running = false;

  const follow = function () {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";

    if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) requestAnimationFrame(follow);
    else running = false;
  }

  document.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
    root.classList.add("has-cursor");

    const interactive = event.target.closest("a, button, .project-card, .gallery-card");
    ring.classList.toggle("is-hovering", !!interactive);

    if (!running) {
      running = true;
      requestAnimationFrame(follow);
    }
  });

  document.addEventListener("pointerleave", function () { root.classList.remove("has-cursor"); });
}
