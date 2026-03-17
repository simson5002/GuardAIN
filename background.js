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

async function fetchBackendRisk(domain) {
  try {
    const response = await fetch(`http://localhost:3000/check-domain?domain=${encodeURIComponent(domain)}`);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Backend unavailable, using local score:', error.message);
    return { risk: 0, isPhishing: false };
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url || !tab.url.startsWith("http")) return;

  const score = analyzePhishingRisk(tab.url);
  const vulnerabilities = [];

  if (!tab.url.startsWith("https://")) {
    vulnerabilities.push("No HTTPS (HSTS missing)");
  }

  // Fetch backend risk if local score moderate/high
  let backendData = { risk: 0, isPhishing: false, reason: 'Local only' };
  if (score > 30) {
    try {
      const urlObj = new URL(tab.url);
      backendData = await fetchBackendRisk(urlObj.hostname);
    } catch (error) {
      console.log('Backend fetch error:', error);
    }
  }

  const finalScore = Math.round(score * 0.7 + backendData.risk * 0.3);
  if (backendData.isPhishing) finalScore = Math.min(100, finalScore + 20); // Boost if known phish

  if (finalScore > 50 || vulnerabilities.length > 0) {
    chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#FF4444" });

    chrome.storage.local.set({
      [tabId]: {
        aiScore: finalScore + "%",
        localScore: score + "%",
        backendRisk: backendData.risk + "% (" + backendData.reason + ")",
        vulnerabilities,
        isPhishing: backendData.isPhishing
      }
    });
  } else {
    chrome.action.setBadgeText({ text: "", tabId });
    chrome.storage.local.remove(tabId.toString());
  }
});
