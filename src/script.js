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
  const startedAt = form.querySelector("[data-started-at]");
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit-button]");
  const originalLabel = submitButton?.textContent || "";

  const resetStartedAt = () => {
    if (startedAt) startedAt.value = String(Date.now());
  };
  resetStartedAt();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (status) {
      status.hidden = true;
      status.classList.remove("is-error");
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = form.dataset.sending || originalLabel;
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.code || "request_failed");

      form.reset();
      resetStartedAt();
      if (status) {
        status.textContent = form.dataset.success;
        status.hidden = false;
        status.focus();
      }
    } catch {
      if (status) {
        status.textContent = form.dataset.error;
        status.classList.add("is-error");
        status.hidden = false;
        status.focus();
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
});
