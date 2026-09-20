export function initAbout() {
    const aboutSection = document.querySelector(".aboutPage");

    if (!aboutSection) return;

    if (!("IntersectionObserver" in window)) {
        aboutSection.classList.add("visible");
        return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("visible");
            observer.disconnect();
        },
        { threshold: 0.12 }
    );

    observer.observe(aboutSection);
}
