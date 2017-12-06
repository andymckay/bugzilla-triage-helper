browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({"url": "/config.html"});
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.startsWith('https://bugzilla.mozilla.org/show_bug.cgi?id=')) {
        browser.pageAction.show(tabId);
    }
    if (showingOverlay) {
        browser.tabs.sendMessage(tabId, {show: showingOverlay});
    }
});

// Will have to persist this.
let showingOverlay = false;

browser.pageAction.onClicked.addListener((tab) => {
    showingOverlay = !showingOverlay;
    browser.tabs.sendMessage(tab.id, {show: showingOverlay});
});