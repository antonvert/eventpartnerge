const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-mobile-menu]");

if (header) {
  const updateHeader = () => header.classList.toggle("site-header--scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

if (menuButton && menu) {
  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.querySelector("span").textContent = open ? menuButton.dataset.closeLabel || "Close" : menuButton.dataset.openLabel || "Menu";
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  };
  menuButton.dataset.openLabel = menuButton.querySelector("span").textContent;
  menuButton.dataset.closeLabel = menuButton.dataset.openLabel === "Меню" ? "Закрыть" : menuButton.dataset.openLabel === "მენიუ" ? "დახურვა" : "Close";
  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("resize", () => { if (window.innerWidth > 880) setMenu(false); });
}

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const success = form.querySelector("[data-form-success]");
    success.textContent = form.dataset.success;
    success.hidden = false;
    success.focus();
  });
});
