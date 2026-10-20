const measurementId = document.querySelector('meta[name="ga4-measurement-id"]')?.content?.trim() || "";
const isProductionHost = ["eventpartner.ge", "www.eventpartner.ge"].includes(window.location.hostname);
const consentKey = "eventpartner_ge_analytics_consent_v1";
const dataLayer = (window.dataLayer = window.dataLayer || []);
window.gtag = window.gtag || function gtag(){ dataLayer.push(arguments); };
let analyticsEnabled = false;

const readConsent = () => {
  try { return window.localStorage.getItem(consentKey); } catch { return null; }
};

const writeConsent = (value) => {
  try { window.localStorage.setItem(consentKey, value); } catch { /* Analytics remains optional. */ }
};

const enableAnalytics = () => {
  if (!isProductionHost || !measurementId || analyticsEnabled) return;
  analyticsEnabled = true;
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });
};

const track = (event, params = {}) => {
  const safe = Object.fromEntries(
    Object.entries(params).filter(([, value]) => typeof value === "string" && value.length <= 100)
  );
  if (analyticsEnabled) window.gtag("event", event, safe);
  else if (!isProductionHost) dataLayer.push({ event, ...safe });
};

const mountConsent = () => {
  if (!isProductionHost || !measurementId) return;
  const stored = readConsent();
  if (stored === "granted") { enableAnalytics(); return; }
  if (stored === "denied") return;
  const banner = document.createElement("aside");
  banner.className = "analytics-consent";
  banner.setAttribute("aria-label", "Analytics preferences");
  banner.innerHTML = '<div><strong>Optional analytics</strong><p>Anonymous usage data helps us improve the site. It is never combined with form details.</p></div><div class="analytics-consent__actions"><button type="button" data-analytics-consent="denied">No thanks</button><button type="button" data-analytics-consent="granted">Allow analytics</button></div>';
  banner.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-analytics-consent]")?.dataset.analyticsConsent;
    if (!choice) return;
    writeConsent(choice);
    if (choice === "granted") enableAnalytics();
    banner.remove();
  });
  document.body.append(banner);
};

mountConsent();

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  if (/^mailto:/i.test(href)) track("click_email", { page_path: window.location.pathname });
  else if (/^tel:/i.test(href)) track("click_phone", { page_path: window.location.pathname });
  else if (/^(?:https?:\/\/)?(?:t\.me|wa\.me|api\.whatsapp\.com)\//i.test(href)) {
    track("click_messenger", { page_path: window.location.pathname, messenger: /t\.me/i.test(href) ? "telegram" : "whatsapp" });
  }
});

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
  let formStarted = false;

  form.addEventListener("focusin", () => {
    if (formStarted) return;
    formStarted = true;
    track("form_start", { page: form.querySelector('[name="page"]')?.value || "unknown" });
  });

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
      formStarted = false;
      resetStartedAt();
      const page = form.querySelector('[name="page"]')?.value || "unknown";
      track("form_submit", { page });
      track("generate_lead", { page, lead_source: "contact_form" });
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
