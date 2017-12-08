let versions = null;

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({"url": "/config.html"});
});

function updateVersions() {
  fetch('https://product-details.mozilla.org/1.0/firefox_versions.json')
  .then(function(response) {
    return response.json();
  }).then(function(json) {
    versions = json;
  });
}


function handleMessage(request, sender, sendResponse) {
  if (request.action === 'getVersions') {
    sendResponse(versions);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
updateVersions();
