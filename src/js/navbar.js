export function initNavbar() {
    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (!menuButton || !mobileMenu) return;

    const desktopQuery = window.matchMedia("(min-width: 761px)");

    const setMenuState = (isOpen) => {
        mobileMenu.classList.toggle("open", isOpen);
        menuButton.classList.toggle("active", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        mobileMenu.setAttribute("aria-hidden", String(!isOpen));
        // Stop the page scrolling behind the open menu
        document.body.classList.toggle("menu-open", isOpen);
    };

    const closeMenu = () => setMenuState(false);

    setMenuState(false);

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    // Rotating a tablet or widening the window shouldn't leave the menu stuck open
    desktopQuery.addEventListener("change", (event) => {
        if (event.matches) closeMenu();
    });
}
