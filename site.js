/* ============================================================
   EduMap — site.js
   Small, dependency-free behaviors shared by every page:
     1. Mobile nav toggle (the header hides links under 880px;
        this is what lets you actually open them on a phone).
     2. Scroll-reveal: fades/slides sections in as you reach them.
        Skipped entirely if the visitor has motion reduced.
     3. Toast: a small "Saved" / "Deleted" confirmation, used by
        the Admin page so actions feel acknowledged instead of
        silent.
   Load this after data.js on every page:
     <script src="site.js"></script>
   ============================================================ */

/* ---------- 1. mobile nav ---------- */
(function () {
  const header = document.querySelector(".site-header .wrap");
  if (!header) return;
  const navLinks = header.querySelector(".nav-links");
  if (!navLinks) return;

  const btn = document.createElement("button");
  btn.className = "nav-toggle";
  btn.setAttribute("aria-label", "Open menu");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(btn);

  btn.addEventListener("click", function () {
    const open = navLinks.classList.toggle("is-open");
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  // Close the menu after tapping a link (so it doesn't stay open
  // when the new page loads).
  navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => navLinks.classList.remove("is-open"))
  );
})();

/* ---------- 2. scroll reveal ---------- */
(function () {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (!targets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  targets.forEach(t => observer.observe(t));
})();

/* ---------- 3. toast ---------- */
let toastTimer = null;
function showToast(message, tone) {
  let el = document.getElementById("edumap-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "edumap-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = "toast is-visible" + (tone ? " toast-" + tone : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
}

/* ---------- 4. Hero slideshow ---------- */
(function () {
  function startSlideshow() {
    const slides = document.querySelectorAll(".slideshow .slide");

    console.log("Number of slides found:", slides.length);

    if (slides.length <= 1) {
      console.warn("Slideshow: Not enough slides found");
      return;
    }

    let current = 0;

    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === 0);
    });

    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
      console.log("Switched to slide:", current + 1);
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSlideshow);
  } else {
    startSlideshow();
  }
})();