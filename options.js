// options.js
const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["groqApiKey", "aiModel"], (data) => {
  if (data.groqApiKey) apiKeyInput.value = data.groqApiKey;
  if (data.aiModel && modelSelect) modelSelect.value = data.aiModel;
});

saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  const model = modelSelect?.value || "llama-3.2-90b-vision-preview";
  chrome.storage.sync.set({ groqApiKey: key, aiModel: model }, () => {
    statusEl.textContent = "Saved";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
});
