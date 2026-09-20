import { initAbout } from "./about.js";
import { initContact } from "./contact.js";
import { initNavbar } from "./navbar.js";

const componentPaths = Object.freeze({
    navbar: "./pages/navbar.html",
    about: "./pages/about.html",
    contact: "./pages/contact.html"
});

const heroSlides = Object.freeze([
    {
        src: "./assets/heroCover.jpeg",
        alt: "Abiudi performing"
    },
    {
        src: "./assets/abiudiMain.jpeg",
        alt: "Abiudi playing guitar during a performance"
    },
    {
        src: "./assets/abiudiMain2.jpeg",
        alt: "Abiudi holding an electric guitar"
    },
    {
        src: "./assets/contactback.jpeg",
        alt: "Abiudi with a guitar in a studio setting"
    }
]);

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

async function loadComponents() {
    const mounts = [...document.querySelectorAll("[data-component]")];

    await Promise.all(mounts.map(loadComponent));
}

function initGallery() {
    const galleryItems = document.querySelectorAll(".gallery-image");
    const supportsHover = window.matchMedia("(pointer: fine)").matches;

    galleryItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 180}ms`;

        const image = item.querySelector("img");

        if (!image || !supportsHover) return;

        item.addEventListener("mousemove", (event) => {
            const rect = item.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            const moveX = (x - 0.5) * 8;
            const moveY = (y - 0.5) * 8;

            image.style.transform =
                `scale(1.06) translate(${moveX}px, ${moveY}px)`;
        });

        item.addEventListener("mouseleave", () => {
            image.style.transform = "scale(1) translate(0, 0)";
        });
    });

    if (!("IntersectionObserver" in window)) {
        galleryItems.forEach((item) => item.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12 }
    );

    galleryItems.forEach((item) => observer.observe(item));
}

function initHeroSlideshow() {
    let currentImage = document.querySelector(".heroImage--current");
    let nextImage = document.querySelector(".heroImage--next");

    if (!currentImage || !nextImage || heroSlides.length < 2) return;

    heroSlides.slice(1).forEach(({ src }) => {
        const preloadedImage = new Image();
        preloadedImage.src = src;
    });

    let currentSlide = 0;
    let rotationTimer;

    const showNextSlide = () => {
        currentSlide = (currentSlide + 1) % heroSlides.length;
        const nextSlide = heroSlides[currentSlide];
        let hasTransitioned = false;

        const completeTransition = () => {
            if (hasTransitioned) return;
            hasTransitioned = true;

            nextImage.classList.add("is-visible");
            currentImage.classList.add("is-hidden");

            window.setTimeout(() => {
                const previousImage = currentImage;
                currentImage = nextImage;
                nextImage = previousImage;
            }, 700);
        };

        nextImage.onload = completeTransition;
        nextImage.src = nextSlide.src;
        nextImage.alt = nextSlide.alt;

        if (nextImage.complete) completeTransition();
    };

    const startRotation = () => {
        if (rotationTimer) return;
        rotationTimer = window.setInterval(showNextSlide, 5000);
    };

    const stopRotation = () => {
        window.clearInterval(rotationTimer);
        rotationTimer = undefined;
    };

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopRotation();
        } else {
            startRotation();
        }
    });

    startRotation();
}

async function initializePage() {
    await loadComponents();

    initNavbar();
    initAbout();
    initContact();
    initGallery();
    initHeroSlideshow();
}

function start() {
    initializePage().catch((error) => {
        console.error("Unable to initialize the page.", error);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}
