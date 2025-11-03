// options.js
const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["openrouterApiKey", "aiModel"], (data) => {
  if (data.openrouterApiKey) apiKeyInput.value = data.openrouterApiKey;
  if (data.aiModel && modelSelect) modelSelect.value = data.aiModel;
});

saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  const model = modelSelect?.value || "deepseek/deepseek-chat";
  chrome.storage.sync.set({ openrouterApiKey: key, aiModel: model }, () => {
    statusEl.textContent = "Saved";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
});
