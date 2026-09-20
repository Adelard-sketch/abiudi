export function initContact() {
    const contactLink = document.querySelector(".portfolio-bottomline a");

    if (!contactLink) return;

    contactLink.addEventListener("click", () => {
        contactLink.classList.add("is-contacted");
    });
}
