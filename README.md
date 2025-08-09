# Study Helper (Gemini) Chrome Extension

Educational Chrome extension scaffold that lets you manually enter or select text and obtain study hints via Google's Gemini API.

## Features

- Context menu: select text on any page and choose "Get study hints for selected text".
- Popup: manually enter a question or topic and request hints.
- Options page: store Gemini API key in Chrome sync storage.
- Content script floating panel shows selected text and AI hints.
- Protective prompt instructs model to provide conceptual help (not direct cheating answers).

## Setup

1. Get a Gemini API key from Google AI Studio.
2. Open Chrome > Extensions > Enable Developer Mode.
3. Click "Load unpacked" and select this folder.
4. Open extension's Options and paste your API key.
5. Select any text on a page, right-click, choose the context menu item.

## Privacy

- API key stored in Chrome sync storage (encrypted in transit, synced with your account). Remove the key anytime via Options.
- No external server besides direct call to Google Generative Language API.

## Notes

- Respect site terms and academic integrity. Use only for legitimate studying.
- Rate limits or API errors will appear in the panel.

## Future Ideas

- Toggle between summary / flashcard / outline modes.
- Add markdown rendering.
- Export to local JSON for spaced repetition.

---

For learning purposes only.
