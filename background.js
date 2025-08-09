// background.js
// Creates context menu and handles messaging + Gemini API calls.
// Adds dynamic model selection & improved error diagnostics.

const DEFAULT_MODEL = "gemini-1.5-flash"; // modern lightweight model
const FALLBACK_MODEL_OLD = "gemini-pro"; // legacy name in case user stored it

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
  if (msg.type === "GEMINI_REQUEST") {
    handleGeminiRequest(msg.payload).then(sendResponse); // sendResponse async
    return true; // keep port open
  }
});

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["geminiApiKey", "geminiModel"], (data) => {
      resolve({
        apiKey: data.geminiApiKey || "",
        model: data.geminiModel || DEFAULT_MODEL,
      });
    });
  });
}

async function handleGeminiRequest({ prompt, style = "concise" }) {
  const { apiKey, model } = await getConfig();
  if (!apiKey) {
    return { ok: false, error: "No API key set. Add it in extension options." };
  }

  const effectiveModel = model || DEFAULT_MODEL;

  const styleInstruction = buildStyleInstruction(style);

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are an academic Q&A assistant. Follow user style instructions. try providing the correct answers; try to avoid wrong answers; try to understand the question deeply.\nDesired style: ${styleInstruction}\nQuestion: ${prompt}`,
          },
        ],
      },
    ],
  };

  // Try new stable v1 endpoint first, then fall back to v1beta if 404
  const baseUrls = [
    `https://generativelanguage.googleapis.com/v1/models/${effectiveModel}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey}`,
  ];

  let lastErrorText = "";
  for (const url of baseUrls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const snippet = await safeReadText(res);
        lastErrorText = `HTTP ${res.status}: ${truncate(snippet, 260)}`;
        // If 404 or 400, try next variant; else break immediately
        if (
          res.status !== 404 &&
          !(res.status === 400 && url.includes("v1/"))
        ) {
          return { ok: false, error: lastErrorText };
        }
        continue; // attempt fallback
      }
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
        "No response.";
      return { ok: true, text };
    } catch (e) {
      lastErrorText = e.message;
    }
  }
  // If we reach here, both attempts failed. Provide guidance.
  return {
    ok: false,
    error:
      lastErrorText ||
      "Failed calling Gemini API. Check model name, key validity, and network restrictions.",
  };
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
