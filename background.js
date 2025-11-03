// background.js
// Creates context menu and handles messaging + DeepSeek R1 API calls via OpenRouter.
// Adds dynamic model selection & improved error diagnostics.

const DEFAULT_MODEL = "deepseek/deepseek-chat"; // DeepSeek Chat - faster alternative

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "study_helper_ask",
    title: "Get study hints for selected text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "study_helper_ask" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "STUDY_HELPER_PROCESS_SELECTION",
      text: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "DEEPSEEK_REQUEST") {
    handleDeepSeekRequest(msg.payload).then(sendResponse);
    return true; // keep port open
  }
});

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["openrouterApiKey", "aiModel"], (data) => {
      resolve({
        apiKey: data.openrouterApiKey || "",
        model: data.aiModel || DEFAULT_MODEL,
      });
    });
  });
}

async function handleDeepSeekRequest({ prompt, style = "concise" }) {
  const { apiKey, model } = await getConfig();
  if (!apiKey) {
    return { ok: false, error: "No API key set. Add it in extension options." };
  }

  const effectiveModel = model || DEFAULT_MODEL;
  const styleInstruction = buildStyleInstruction(style);

  const body = {
    model: effectiveModel,
    messages: [
      {
        role: "system",
        content: `You are an academic Q&A assistant. Follow user style instructions. Try providing the correct answers; try to avoid wrong answers; try to understand the question deeply.\nDesired style: ${styleInstruction}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  // Use OpenRouter API endpoint
  const url = `https://openrouter.ai/api/v1/chat/completions`;

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/MaharajTanim/Q-A-Extension",
        "X-Title": "Study Helper Extension",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const snippet = await safeReadText(res);
      return {
        ok: false,
        error: `HTTP ${res.status}: ${truncate(
          snippet,
          300
        )}. Try checking: 1) API key validity at OpenRouter, 2) Model availability, 3) Network connection.`,
      };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "No response.";
    return { ok: true, text };
  } catch (e) {
    if (e.name === "AbortError") {
      return {
        ok: false,
        error: `Request timeout after 60 seconds. DeepSeek R1 is reasoning-heavy and can be slow. Try: 1) Using a faster model like 'DeepSeek Chat' in settings, 2) Asking simpler questions, 3) Waiting a bit longer.`,
      };
    }
    return {
      ok: false,
      error: `Request failed: ${e.message}. Check network connection and API key.`,
    };
  }
}

async function safeReadText(res) {
  try {
    return await res.text();
  } catch (_) {
    return "(no body)";
  }
}

function truncate(s, max) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function buildStyleInstruction(style) {
  switch (style) {
    case "detailed":
      return "Detailed answer with structured sections: brief direct answer first, then explanation, examples, and a short summary.";
    case "bullets":
      return "Answer as concise bullet points (max 8) plus a one-line takeaway.";
    case "concise":
    default:
      return "Single-paragraph concise answer (<=80 words)";
  }
}
