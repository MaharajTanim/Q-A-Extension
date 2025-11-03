// contentScript.js
// Injects a floating panel when triggered, receives responses.

let panel;

// Auto open panel on page load if user enabled setting
chrome.storage.sync.get(["autoPanel"], (data) => {
  if (data.autoPanel) {
    createPanel("Ready for your question...");
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STUDY_HELPER_PROCESS_SELECTION") {
    createPanel(msg.text);
  } else if (msg.type === "STUDY_HELPER_RESPONSE") {
    updatePanel(msg.data);
  }
});

function createPanel(text) {
  if (panel) panel.remove();
  panel = document.createElement("div");
  panel.className = "study-helper-panel";
  panel.innerHTML = `
    <div class="sh-header">Study Helper <button class="sh-close">×</button></div>
    <div class="sh-body">
      <div class="sh-section"><strong>Selected:</strong><div class="sh-selected"></div></div>
      <div class="sh-section"><strong>Hints:</strong><div class="sh-output">Loading...</div></div>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector(".sh-selected").textContent = text;
  panel
    .querySelector(".sh-close")
    .addEventListener("click", () => panel.remove());
  requestHints(text);
}

function updatePanel(data) {
  if (!panel) return;
  const out = panel.querySelector(".sh-output");
  if (!data.ok) {
    out.textContent = "Error: " + data.error;
  } else {
    out.textContent = data.text;
  }
}

function requestHints(prompt) {
  chrome.runtime.sendMessage(
    { type: "DEEPSEEK_REQUEST", payload: { prompt } },
    (resp) => {
      chrome.runtime.sendMessage({ type: "STUDY_HELPER_RESPONSE", data: resp });
    }
  );
}
