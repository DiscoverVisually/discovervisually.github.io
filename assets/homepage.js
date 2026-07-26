const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  navigation.removeAttribute("data-open");
  document.body.classList.remove("menu-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) {
      navigation.removeAttribute("data-open");
      document.body.classList.remove("menu-open");
    } else {
      navigation.setAttribute("data-open", "true");
      document.body.classList.add("menu-open");
    }
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });
}

const spotlightData = {
  women: {
    image: "/assets/spread-women-of-the-bible.webp",
    alt: "Interior spread from Women of the Bible for Today",
    kicker: "Visual Bible study · For women",
    title: "Stories of faith, seen differently.",
    href: "/books/women-of-the-bible-for-today.html"
  },
  pompeii: {
    image: "/assets/spread-pompeii.webp",
    alt: "Interior spread from Pompeii: The Last Day",
    kicker: "Visual history · Ages 8–12",
    title: "The ancient world, made immediate.",
    href: "/books/pompeii-the-last-day.html"
  },
  romantasy: {
    image: "/assets/spread-romantasy-yearbook.webp",
    alt: "Interior spread from The Ultimate Romantasy Yearbook",
    kicker: "Romantasy · Visual genre guide",
    title: "A reader culture mapped in full color.",
    href: "/books/the-ultimate-romantasy-yearbook.html"
  }
};

const spotlightTabs = [...document.querySelectorAll("[data-spotlight]")];
const spotlightPanel = document.querySelector("#spotlight-panel");
const spotlightImage = document.querySelector("[data-spotlight-image]");
const spotlightKicker = document.querySelector("[data-spotlight-kicker]");
const spotlightTitle = document.querySelector("[data-spotlight-title]");
const spotlightLink = document.querySelector("[data-spotlight-link]");

function selectSpotlight(tab, shouldFocus = false) {
  const key = tab.dataset.spotlight;
  const data = spotlightData[key];
  if (
    !data ||
    !spotlightPanel ||
    !spotlightImage ||
    !spotlightKicker ||
    !spotlightTitle ||
    !spotlightLink
  ) {
    return;
  }

  spotlightTabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.setAttribute("aria-selected", String(active));
    candidate.tabIndex = active ? 0 : -1;
  });

  spotlightPanel.setAttribute("aria-labelledby", tab.id);
  spotlightImage.src = data.image;
  spotlightImage.alt = data.alt;
  spotlightKicker.textContent = data.kicker;
  spotlightTitle.textContent = data.title;
  spotlightLink.href = data.href;

  if (shouldFocus) tab.focus();
}

spotlightTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSpotlight(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + spotlightTabs.length) % spotlightTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % spotlightTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = spotlightTabs.length - 1;

    selectSpotlight(spotlightTabs[nextIndex], true);
  });
});
