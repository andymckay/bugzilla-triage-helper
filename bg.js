let versions = null;
let FIREFOX_VERSION_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json";
let BUGZILLA_PARAMS = "?priority=--&f1=triage_owner&o1=equals&resolution=---&o2=notequals&query_format=advanced&f2=flagtypes.name&v2=needinfo%3F&include_fields=id";
let BUGZILLA_BROWSER_URL = "https://bugzilla.mozilla.org/buglist.cgi";
let BUGZILLA_QUERY_URL = "https://bugzilla.mozilla.org/rest/bug";
let BUGZILLA_REFRESH_INTERVAL = 60 * 2 * 1000;

function log(msg) {
  console.log(`[triage-helper] ${msg}.`);  // eslint-disable-line no-console
}

browser.browserAction.onClicked.addListener(() => {
  browser.storage.local.get()
    .then(data => {
      if (!data.email) {
        browser.tabs.create({"url": "/config.html?msg=msg-no-email"});
      } else {
        browser.tabs.create({"url": `${BUGZILLA_BROWSER_URL}${BUGZILLA_PARAMS}&v1=${data.email}`});
      }
    });
});

let fetches = {
  updateVersions: async function() {
    let res = await fetch(FIREFOX_VERSION_URL);
    versions = await res.json();
    return versions;
  },
  getBugCount: async function() {
    let data = await browser.storage.local.get();
    if (data.bugs && ((Date.now() - data.bugs.when) < BUGZILLA_REFRESH_INTERVAL)) {
      log("returning from cache");
      return data.bugs.count;
    }

    if (!data.email) {
      log("No email, not fetching");
    }

    let url = `${BUGZILLA_QUERY_URL}${BUGZILLA_PARAMS}&v1=${data.email}`;
    let res = await fetch(url);
    let json = await res.json();
    await browser.storage.local.set({bugs: {count: json.bugs.length, when: Date.now()}});
    log(`Got bug count from Bugzilla: ${json.bugs.length}`);
    return json.bugs.length;
  },
  showBugCount: async function() {
    let count = await fetches.getBugCount();
    let countStr = count.toString();
    if (count < 10) {
      browser.browserAction.setBadgeBackgroundColor({color: "green"});
    } else if (count > 50) {
      browser.browserAction.setBadgeBackgroundColor({color: "red"});
    } if (count > 99) {
      countStr = "99+";
    }
    browser.browserAction.setBadgeText({text: countStr});
  }
};

function handleMessage(request, sender, sendResponse) {
  if (request.action === "getVersions") {
    sendResponse(versions);
  }
  if (request.action == "getConfig") {
    browser.storage.local.get()
      .then(data => {
        sendResponse(data);
      });
  }
  return true;
}

function handleAlarm(alarmInfo) {
  if (alarmInfo.name === "showBugCount") {
    fetches.showBugCount();
  }
}

browser.alarms.create("showBugCount", {periodInMinutes: 1});
browser.alarms.onAlarm.addListener(handleAlarm);
fetches.showBugCount();

browser.runtime.onMessage.addListener(handleMessage);
fetches.updateVersions();
