/* =========================================
   TOOL ACCESS CONTROL
========================================= */

function guardToolAccess(toolKey, toolName, callback) {
  const user = typeof firebase !== "undefined" && firebase.auth ? firebase.auth().currentUser : null;
  const userEmail = user ? user.email : null;
  const result = checkAndShowToolAccess(toolKey, toolName, userEmail);

  if (!result.canAccess) {
    if (typeof showToast === "function") {
      showToast(result.message, "error");
    } else {
      alert(result.message);
    }
    return false;
  }

  if (typeof callback === "function") {
    callback();
  }

  return true;
}

function initToolAccessControl() {
  if (typeof firebase === "undefined" || !firebase.auth) {
    return;
  }

  firebase.auth().onAuthStateChanged(function(user) {
    const tools = [
      { key: "qrGenerator", selector: ".qr-card" },
      { key: "tikTokDownloader", selector: ".tiktok-card" },
      { key: "createBaseBot", selector: ".bot-card" },
    ];

    tools.forEach(function(tool) {
      const element = document.querySelector(tool.selector);
      if (!element) return;

      const currentUserEmail = user ? user.email : null;
      const canAccess = canAccessTool(tool.key, currentUserEmail);
      const info = getToolAccessInfo(tool.key);

      const existingOverlay = element.querySelector(".tool-lock-overlay");
      if (existingOverlay) {
        existingOverlay.remove();
      }

      if (!canAccess && currentUserEmail) {
        const lockElement = document.createElement("div");
        lockElement.className = "tool-lock-overlay";
        lockElement.innerHTML = `
          <div class="tool-lock-badge">
            <span class="lock-icon">🔒</span>
            <span class="lock-text">${info.message}</span>
          </div>
        `;
        element.style.position = "relative";
        element.appendChild(lockElement);
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initToolAccessControl);
} else {
  initToolAccessControl();
}
