import { initAbout } from "./about.js";
import { initContact } from "./contact.js";
import { initNavbar } from "./navbar.js";

const componentPaths = Object.freeze({
    navbar: "./pages/navbar.html",
    about: "./pages/about.html",
    contact: "./pages/contact.html"
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Components ---------- */

async function loadComponent(mount) {
    const componentName = mount.dataset.component;
    const componentPath = componentPaths[componentName];

    if (!componentPath) {
        console.warn(`Unknown component: ${componentName}`);
        return;
    }

    try {
        const response = await fetch(componentPath);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        mount.innerHTML = await response.text();
    } catch (error) {
        console.error(`Unable to load ${componentName} component.`, error);
    }
}

function loadComponents() {
    const mounts = [...document.querySelectorAll("[data-component]")];
    return Promise.all(mounts.map(loadComponent));
}

/* Run each init on its own so one failure can't stop the rest */
function safeInit(name, init) {
    try {
        init();
    } catch (error) {
        console.error(`Unable to initialise ${name}.`, error);
    }
}

/* ---------- Page loader ----------
   Lifts once the components and the cover photo are ready,
   shows for at least 700ms, and never for more than 2.5s. */

function waitForImage(img) {
    if (!img || img.complete) return Promise.resolve();
    return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
    });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hideLoader() {
    const loader = document.getElementById("pageLoader");
    document.body.classList.remove("loading");

    if (!loader) return;
    loader.classList.add("hidden");
    loader.addEventListener("transitionend", () => loader.remove(), { once: true });
    setTimeout(() => loader.remove(), 800);
}

/* ---------- Scroll to top ---------- */

function initScrollToTop() {
    const button = document.getElementById("scrollToTop");
    if (!button) return;

    let ticking = false;

    const update = () => {
        button.classList.toggle("visible", window.scrollY > 600);
        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    update();
}

/* ---------- Credits card counters ---------- */

function initCreditCounters() {
    const stats = [...document.querySelectorAll(".creditStat")];
    if (!stats.length || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const countUp = (stat, delay) => {
        const output = stat.querySelector(".creditStat-number");
        const target = Number.parseInt(stat.dataset.number, 10);
        if (!output || Number.isNaN(target)) return;

        const duration = 1400;
        let start;

        const frame = (now) => {
            start ??= now;
            const progress = Math.min((now - start) / duration, 1);
            output.textContent = Math.round(target * easeOut(progress)).toLocaleString();
            if (progress < 1) requestAnimationFrame(frame);
        };

        setTimeout(() => requestAnimationFrame(frame), delay);
    };

    // Start from zero only once we know the card will animate
    stats.forEach((stat) => {
        const output = stat.querySelector(".creditStat-number");
        if (output) output.textContent = "0";
    });

    const card = stats[0].closest(".creditCard") ?? stats[0];

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        stats.forEach((stat, index) => countUp(stat, index * 120));
        observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(card);
}

/* ---------- Boot ---------- */

async function initializePage() {
    const shownAt = performance.now();
    const coverImage = document.querySelector(".coverPhoto img");
    const coverReady = Promise.race([waitForImage(coverImage), wait(2500)]);

    await loadComponents();

    safeInit("navbar", initNavbar);
    safeInit("about", initAbout);
    safeInit("contact", initContact);
    safeInit("scroll to top", initScrollToTop);
    safeInit("credits", initCreditCounters);

    await coverReady;

    const elapsed = performance.now() - shownAt;
    if (elapsed < 700) await wait(700 - elapsed);

    hideLoader();
}

function start() {
    initializePage().catch((error) => {
        console.error("Unable to initialise the page.", error);
        hideLoader();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}
