browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({"url": "/config.html"});
});
