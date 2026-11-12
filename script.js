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

// Daily Toolbox: copy each row of logos so the slide loops without a gap
document.querySelectorAll(".marquee__track").forEach((track) => {
  const set = track.querySelector(".marquee__set");
  if (!set) return;
  const copy = set.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  track.appendChild(copy);
});

// In-page links: scroll to the section without putting "#work" in the address bar
const cleanUrl = () => history.replaceState(null, "", location.pathname + location.search);

// If a link's id isn't on the page, fall back to the section by its class
const fallbackSections = {
  "#work": ".work",
  "#interview": ".convo",
  "#conversation": ".convo",
  "#about": ".about",
  "#services": ".services",
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

// Sections: fade each piece in as it scrolls into view
const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}