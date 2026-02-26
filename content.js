// content.js

(function detectLoopholes() {
  const issues = [];

  const passwords = document.querySelectorAll('input[type="password"]');
  if (passwords.length && location.protocol !== "https:") {
    issues.push("CRITICAL: Password on insecure HTTP");
  }

  const tabnaps = document.querySelectorAll(
    'a[target="_blank"]:not([rel~="noopener"])'
  );
  if (tabnaps.length) {
    issues.push("WARNING: Tabnapping risk");
  }

  if (issues.length) {
    // Inject animation styles once
    if (!document.getElementById("guardiain-style")) {
      const style = document.createElement("style");
      style.id = "guardiain-style";
      style.textContent = `
        @keyframes guardiain-slide {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    const banner = document.createElement("div");

    banner.innerHTML = `
      <span style="font-size:18px;">🛡️</span>
      <span>GuardiAIN Alert: ${issues[0]}</span>
    `;

    banner.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;

      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: #ffffff;

      padding: 14px 24px;
      border-radius: 10px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);

      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 15px;
      font-weight: 600;

      display: flex;
      align-items: center;
      gap: 10px;

      animation: guardiain-slide 0.4s ease-out;
    `;

    document.body.appendChild(banner);
  }
})();
