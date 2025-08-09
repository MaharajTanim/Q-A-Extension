// options.js
const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["geminiApiKey", "geminiModel"], (data) => {
  if (data.geminiApiKey) apiKeyInput.value = data.geminiApiKey;
  if (data.geminiModel && modelSelect) modelSelect.value = data.geminiModel;
});

saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  const model = modelSelect?.value || "gemini-1.5-flash";
  chrome.storage.sync.set({ geminiApiKey: key, geminiModel: model }, () => {
    statusEl.textContent = "Saved";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
});
