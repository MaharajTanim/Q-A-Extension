# Study Helper (DeepSeek R1) Chrome Extension

Educational Chrome extension that lets you manually enter or select text and obtain study hints via DeepSeek R1 through OpenRouter's free API.

## Features

- Context menu: select text on any page and choose "Get study hints for selected text".
- Popup: manually enter a question or topic and request hints.
- Options page: store OpenRouter API key in Chrome sync storage.
- Content script floating panel shows selected text and AI hints.
- Protective prompt instructs model to provide conceptual help (not direct cheating answers).
- **Completely FREE** - uses DeepSeek R1 via OpenRouter's free tier!

## Setup

1. Get a free API key from [OpenRouter](https://openrouter.ai/keys).
2. Open Chrome > Extensions > Enable Developer Mode.
3. Click "Load unpacked" and select this folder.
4. Open extension's Options and paste your API key.
5. Select any text on a page, right-click, choose the context menu item.

## Privacy

- API key stored in Chrome sync storage (encrypted in transit, synced with your account). Remove the key anytime via Options.
- API calls go through OpenRouter to DeepSeek R1.

## Notes

- Respect site terms and academic integrity. Use only for legitimate studying.
- DeepSeek R1 is free on OpenRouter with generous rate limits.

## Future Ideas

- Toggle between summary / flashcard / outline modes.
- Add markdown rendering.
- Export to local JSON for spaced repetition.

---

For learning purposes only.
