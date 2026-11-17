document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Heading: split into words so each one can slide up on load
const title = document.querySelector(".hero__title");
if (title) {
  let index = 0;

  const split = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "word";
          const inner = document.createElement("span");
          inner.className = "word__in";
          inner.textContent = part;
          inner.style.setProperty("--i", index++);
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        split(child);
      }
    });
  };

  split(title);
  title.classList.add("is-ready");
}

// Buttons + nav links: wrap each letter so it can roll up on hover
document.querySelectorAll(".btn, .nav__links a").forEach((el) => {
  const textNode = [...el.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
  );
  if (!textNode) return;

  const label = textNode.textContent.trim();
  const roll = document.createElement("span");
  roll.className = "roll";
  roll.setAttribute("aria-hidden", "true");

  [...label].forEach((ch, i) => {
    const char = ch === " " ? "\u00A0" : ch;
    const wrap = document.createElement("span");
    wrap.className = "roll__char";
    wrap.style.setProperty("--i", i);
    for (let n = 0; n < 2; n++) {
      const copy = document.createElement("span");
      copy.textContent = char;
      wrap.appendChild(copy);
    }
    roll.appendChild(wrap);
  });

  el.setAttribute("aria-label", label);
  textNode.replaceWith(roll);
});

// In-page links: scroll to the section without putting "#work" in the address bar
const cleanUrl = () => history.replaceState(null, "", location.pathname + location.search);

// If a link's id isn't on the page, fall back to the section by its class
const fallbackSections = {
  "#work": ".work",
  "#interview": ".convo",
  "#conversation": ".convo",
};

const findTarget = (id) => {
  const byId = document.querySelector(id);
  if (byId) return byId;
  return fallbackSections[id] ? document.querySelector(fallbackSections[id]) : null;
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href");

  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Placeholder links ("#") do nothing until you add a real link
    if (id === "#") return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";

    if (id === "#top") {
      window.scrollTo({ top: 0, behavior });
    } else {
      const target = findTarget(id);
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });
      } else {
        console.warn("No section found for " + id);
      }
    }

    cleanUrl();
  });
});

// If someone opens the page with a hash already in the link, tidy it up
if (location.hash) cleanUrl();

// Mobile menu: the hamburger button opens and closes the links
const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".nav__toggle");
if (nav && menuToggle) {
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuToggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));

  // close after choosing a link, pressing Escape, tapping outside, or growing the window
  document.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) setMenu(false); });
  window.matchMedia("(min-width: 721px)").addEventListener("change", () => setMenu(false));
}

// Conversation: James "types" before each answer appears
const jamesBubbles = document.querySelectorAll(".bubble--james");
if (!prefersReducedMotion) {
  jamesBubbles.forEach((bubble) => {
    const dots = document.createElement("span");
    dots.className = "typing";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<i></i><i></i><i></i>";
    bubble.appendChild(dots);
    bubble.classList.add("is-typing");
  });
}

const finishTyping = (el) => {
  if (!el.classList.contains("is-typing")) return;
  const answer = el.querySelector(".bubble__a");
  const len = answer ? answer.textContent.length : 0;
  setTimeout(() => el.classList.remove("is-typing"), 600 + Math.min(len, 160) * 5);
};

// Work + conversation sections: fade each piece in as it scrolls into view
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          finishTyping(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => {
    el.classList.add("is-visible");
    el.classList.remove("is-typing");
  });
}

// Footer: pressing "Designed by James Karlson" sends a little ship sailing along the divider
const credit = document.querySelector(".footer__credit");
const footerBottom = document.querySelector(".footer__bottom");
if (credit && footerBottom && !prefersReducedMotion) {
  let sailing = false;

  credit.addEventListener("click", () => {
    if (sailing) return;
    sailing = true;

    const ship = document.createElement("span");
    ship.className = "ship";
    ship.setAttribute("aria-hidden", "true");
    ship.style.setProperty("--run", footerBottom.clientWidth + "px");
    ship.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>' +
      '<path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>' +
      '<path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>' +
      '<path d="M12 10v4"/><path d="M12 2v3"/></svg>';
    footerBottom.appendChild(ship);

    ship.addEventListener("animationend", (e) => {
      if (e.animationName === "ship-sail") {
        ship.remove();
        sailing = false;
      }
    });
  });
}

// Scroll motion (mobile + desktop): gentle parallax and a fading hero as you scroll
if (!prefersReducedMotion) {
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const heroInner = document.querySelector(".hero__inner");
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) return;      // only work on what is near the screen
      const y = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.parallax);
      el.style.setProperty("--py", y.toFixed(1) + "px");
    });

    if (heroInner) {
      const s = Math.min(window.scrollY, vh);
      heroInner.style.setProperty("--hy", (s * 0.18).toFixed(1) + "px");
      heroInner.style.setProperty("--ho", Math.max(0, 1 - s / (vh * 0.85)).toFixed(2));
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // Touch screens have no hover, so each service card plays its animation while it is on screen
  if (window.matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
    const live = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)),
      { threshold: 0.55 }
    );
    document.querySelectorAll(".service").forEach((card) => live.observe(card));
  }
}