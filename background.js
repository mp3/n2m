chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyAsMarkdown",
    title: "記事をマークダウンでコピー",
    contexts: ["page", "selection"],
    documentUrlPatterns: ["https://note.com/*/n/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyAsMarkdown") {
    chrome.tabs.sendMessage(tab.id, {
      action: "convertToMarkdown"
    });
  }
});