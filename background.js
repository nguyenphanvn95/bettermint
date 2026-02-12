// BetterMint MV3 service worker
// Purpose: inject the main script into the page's MAIN world using chrome.scripting

/* global chrome */

function injectBetterMint(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId },
    files: ["js/bettermint.js"],
    // MAIN world is required because BetterMint interacts with chess.com's in-page JS.
    world: "MAIN",
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== "BETTERMINT_INJECT") return;
  const tabId = sender?.tab?.id;
  if (typeof tabId !== "number") {
    sendResponse({ ok: false, error: "No tab id" });
    return;
  }

  injectBetterMint(tabId)
    .then(() => sendResponse({ ok: true }))
    .catch((err) => {
      // Common cause: injection already happened on the same document.
      sendResponse({ ok: false, error: String(err?.message || err) });
    });

  // Keep the message channel open for async response.
  return true;
});
