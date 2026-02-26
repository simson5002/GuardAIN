chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tabId = tabs[0].id;

  chrome.storage.local.get([tabId.toString()], (res) => {
    const data = res[tabId];
    const score = document.getElementById("score");
    const vulns = document.getElementById("vulns");

    if (data) {
      score.textContent = data.aiScore;
      score.className = "danger";
      vulns.textContent = data.vulnerabilities.join(", ") || "None";
    } else {
      score.textContent = "Safe";
      score.className = "safe";
      vulns.textContent = "Clean";
      vulns.className = "safe";
    }
  });
});
