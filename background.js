// background.js
function analyzePhishingRisk(url) {
  const suspiciousKeywords = ['login', 'secure', 'banking', 'verify', 'update'];
  const trustedDomains = ['google.com', 'paypal.com', 'apple.com', 'microsoft.com'];

  const lower = url.toLowerCase();
  const hasKeyword = suspiciousKeywords.some(k => lower.includes(k));
  const trusted = trustedDomains.some(d => lower.includes(d));

  if (hasKeyword && !trusted) return 85;
  if (lower.includes("0") || lower.includes("-")) return 45;
  return 10;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url || !tab.url.startsWith("http")) return;

  const score = analyzePhishingRisk(tab.url);
  const vulnerabilities = [];

  if (!tab.url.startsWith("https://")) {
    vulnerabilities.push("No HTTPS (HSTS missing)");
  }

  if (score > 50 || vulnerabilities.length > 0) {
    chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#FF4444" });

    chrome.storage.local.set({
      [tabId]: {
        aiScore: score + "%",
        vulnerabilities
      }
    });
  } else {
    chrome.action.setBadgeText({ text: "", tabId });
    chrome.storage.local.remove(tabId.toString());
  }
});
