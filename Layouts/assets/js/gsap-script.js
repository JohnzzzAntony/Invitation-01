// Register GSAP plugins once at the top
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollSmoother);

// ===================== Rolling Text Hover =====================
document.querySelectorAll(".rolling-text").forEach((el) => {
  const text = el.dataset.text || el.textContent.trim();
  el.innerHTML = "";

  const wrapper = document.createElement("span");
  wrapper.className = "text-wrapper";

  ["line1", "line2"].forEach(() => {
    const span = document.createElement("span");
    span.className = "text-line";
    span.textContent = text;
    wrapper.appendChild(span);
  });

  el.appendChild(wrapper);

  el.addEventListener("mouseenter", () => {
    gsap.to(wrapper, { yPercent: -50, duration: 0.4, ease: "power2.out" });
  });

  el.addEventListener("mouseleave", () => {
    gsap.to(wrapper, { yPercent: 0, duration: 0.4, ease: "power2.out" });
  });
});

$(function () {
  let splitTextLines = gsap.utils.toArray(".splittext-line");
  splitTextLines.forEach((splitTextLine) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: splitTextLine,
        start: "top 90%",
        duration: 2,
        end: "bottom 60%",
        scrub: false,
        markers: false,
        toggleActions: "play none none none",
      },
    });

    const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
    gsap.set(splitTextLine, { perspective: 400 });
    itemSplitted.split({ type: "lines" });
    tl.from(itemSplitted.lines, {
      duration: 1,
      delay: 0.5,
      opacity: 0,
      rotationX: -80,
      force3D: true,
      transformOrigin: "top center -50",
      stagger: 0.1,
    });
  });

});

// ===================== Text Opacity Animation =====================
document.querySelectorAll(".text-opacity-animation").forEach((el) => {
  el.innerHTML = el.textContent
    .split("")
    .map((char) => (char === " " ? " " : `<span style="opacity:0.3">${char}</span>`))
    .join("");

  const letters = el.querySelectorAll("span");

  gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 90%",
      end: "bottom 60%",
      scrub: true,
    },
  }).to(letters, {
    opacity: 1,
    stagger: 0.05,
    ease: "power1.out",
    duration: 0.3,
  });
});

// ===================== Poort Text Animations =====================
window.addEventListener("load", () => {
  const st = document.querySelectorAll(".poort-text");
  if (!st.length) return;

  st.forEach((el) => {
    el.split = new SplitText(el, { type: "lines,words,chars", linesClass: "poort-line" });
    gsap.set(el, { perspective: 600 });

    if (el.classList.contains("poort-in-right")) gsap.set(el.split.chars, { opacity: 0, x: 100 });
    if (el.classList.contains("poort-in-left")) gsap.set(el.split.chars, { opacity: 0, x: -100 });
    if (el.classList.contains("poort-in-up")) gsap.set(el.split.chars, { opacity: 0, y: 80 });
    if (el.classList.contains("poort-in-down")) gsap.set(el.split.chars, { opacity: 0, y: -80 });

    gsap.to(el.split.chars, {
      scrollTrigger: { trigger: el, start: "top 90%" },
      x: 0,
      y: 0,
      opacity: 1,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.02,
      ease: "power2.out",
    });
  });
});

// ===================== Image Scroll Animation =====================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".new_img-animet").forEach((el) => {
    const image = el.querySelector("img");
    if (!image) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 50%",
        toggleActions: "play none none none",
      },
    })
      .set(el, { autoAlpha: 1 })
      .from(el, { xPercent: -100, duration: 2, ease: "power2.out" })
      .from(image, { xPercent: 100, duration: 2, ease: "power2.out" }, "<");
  });
});

// ===================== Mousemove Parallax (image-move) =====================
document.addEventListener("mousemove", (e) => {
  const depth = 200;
  const moveX = (e.pageX - window.innerWidth / 2) / depth;
  const moveY = (e.pageY - window.innerHeight / 2) / depth;

  gsap.utils.toArray(".image-move, .image-move2").forEach((circle, i) => {
    gsap.to(circle, {
      x: moveX * (i + 1),
      y: moveY * (i + 1),
      duration: 0.5,
      ease: "power2.out",
    });
  });
});

// ===================== Advanced Feature Animation =====================
if (document.querySelectorAll('.scroll-image').length > 0) {
  const advancedTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-image", // triggers on first matching element
      start: "top 80%",
      toggleActions: "play none none reverse",
      markers: false
    },
    defaults: {
      ease: "power1.out",
      duration: 1.5
    }
  });

  advancedTimeline
    .from(".scroll-image:nth-of-type(1)", { xPercent: 340 })
    .from(".scroll-image:nth-of-type(2)", { xPercent: 240 }, "<")
    .from(".scroll-image:nth-of-type(3)", { xPercent: 180 }, "<")
    .from(".scroll-image:nth-of-type(4)", { xPercent: 20 }, "<")
    .from(".scroll-image:nth-of-type(5)", { xPercent: -80 }, "<")
    .from(".scroll-image:nth-of-type(6)", { xPercent: -180 }, "<")
    .from(".scroll-image:nth-of-type(7)", { xPercent: -270 }, "<");
}

