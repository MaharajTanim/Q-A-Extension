// popup.js
const questionEl = document.getElementById("question");
const askBtn = document.getElementById("ask");
const styleEl = document.getElementById("style");
const resultEl = document.getElementById("result");
const copyBtn = document.getElementById("copy");
const clearBtn = document.getElementById("clear");
const autoPanelChk = document.getElementById("autoPanel");

// Restore autoPanel setting
chrome.storage.sync.get(["autoPanel"], (data) => {
  if (typeof data.autoPanel === "boolean")
    autoPanelChk.checked = data.autoPanel;
});
autoPanelChk?.addEventListener("change", () => {
  chrome.storage.sync.set({ autoPanel: autoPanelChk.checked });
});

askBtn.addEventListener("click", runQuery);
questionEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    runQuery();
  }
});
copyBtn.addEventListener("click", () => {
  if (!copyBtn.disabled) {
    navigator.clipboard.writeText(resultEl.textContent || "");
    copyBtn.textContent = "✔";
    setTimeout(() => (copyBtn.textContent = "📋"), 1200);
  }
});
clearBtn.addEventListener("click", () => {
  questionEl.value = "";
  resultEl.textContent = "Enter a question to begin.";
  resultEl.classList.add("empty");
  copyBtn.disabled = true;
  clearBtn.disabled = true;
});

function runQuery() {
  const text = questionEl.value.trim();
  if (!text) {
    resultEl.textContent = "Please enter a question.";
    resultEl.classList.add("error");
    return;
  }
  resultEl.classList.remove("error", "empty");
  setLoading(true);
  chrome.runtime.sendMessage(
    {
      type: "DEEPSEEK_REQUEST",
      payload: { prompt: text, style: styleEl.value },
    },
    (resp) => {
      setLoading(false);
      if (!resp || !resp.ok) {
        resultEl.textContent = "Error: " + (resp ? resp.error : "Unknown");
        resultEl.classList.add("error");
        copyBtn.disabled = true;
      } else {
        resultEl.textContent = resp.text;
        copyBtn.disabled = false;
        clearBtn.disabled = false;
      }
    }
  );
}

function setLoading(on) {
  if (on) {
    askBtn.disabled = true;
    askBtn.textContent = "...";
    resultEl.textContent = "Thinking...";
    resultEl.classList.remove("error");
    copyBtn.disabled = true;
  } else {
    askBtn.disabled = false;
    askBtn.textContent = "Ask";
  }
}

// If autoPanel is enabled, request content script panel with blank placeholder
chrome.storage.sync.get(["autoPanel"], (data) => {
  if (data.autoPanel) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "STUDY_HELPER_PROCESS_SELECTION",
          text: "Ready for your question...",
        });
      }
    });
  }
});
