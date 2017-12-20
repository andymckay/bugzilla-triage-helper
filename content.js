let userConfig = null;  // eslint-disable-line no-unused-vars
let changeEvent = new UIEvent("change");
let clickEvent = new UIEvent("click");
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);
let bugNumber = params.get("id");
let versions = null;
let newSkin = document.body.classList.contains("skin-Mozilla");

function log(msg) {
  console.log(`[triage-helper:${bugNumber}] ${msg}.`); // eslint-disable-line no-console
}

function roundFirefoxVersion(version) {
  return version.split(".")[0];
}

let eventFunctions = {
  comment: function(text) {
    log("inserting comment");
    let comment = document.getElementById("comment");
    comment.value = text;
    comment.focus();
  },
  flag: function(version, status) {
    log(`setting ${version}`);
    let versionNum = roundFirefoxVersion(versions[version]);
    let statusElement = document.getElementById(`cf_status_firefox${versionNum}`);
    statusElement.value = status;
    statusElement.dispatchEvent(changeEvent);

    if (newSkin) {
      document.getElementById("module-firefox-tracking-flags-header").children[0].dispatchEvent(clickEvent);
    }
  },
  priority: function(priority, severity) {
    log(`changing priority ${priority}`);
    let priorityElement = document.getElementById("priority");
    priorityElement.value = priority;
    priorityElement.dispatchEvent(changeEvent);

    if (severity) {
      let severityElement = document.getElementById("bug_severity");
      severityElement.value = severity;
    }
  },
  status: function(status, resolution, duplicate) {
    log(`changing status ${status}`);
    let statusElement = document.getElementById("bug_status");
    let resolutionElement = document.getElementById("resolution");
    let duplicateElement = document.getElementById("dup_id");

    statusElement.value = status;
    statusElement.dispatchEvent(changeEvent);

    if (status === "RESOLVED") {
      resolutionElement.value = resolution;
      resolutionElement.dispatchEvent(changeEvent);
      if (resolutionElement === "DUPLICATE") {
        duplicateElement.value = duplicate;
      }
    }
  }
};

function processAction(action) {
  let mode = document.getElementById("mode-btn");
  if (mode && !mode.style.display) {
    log("changing mode");
    mode.dispatchEvent(clickEvent);
  }
  for (let key of Object.keys(action.events)) {
    let args = action.events[key];
    eventFunctions[key].apply(null, args);
  }
}

function createOverlay() {
  let container = document.createElement("div");
  container.id = "bugzilla-triage-helper";

  let img = document.createElement("img");
  img.src = browser.runtime.getURL("question.svg");
  img.title = "Bugzilla Triage Helper";
  container.appendChild(img);

  function processEvent(event) {
    let actionEvent = event.target.dataset.action;

    for (let action of actions) {
      if (action.id === actionEvent) {
        log(`Found action for ${actionEvent}`);
        processAction(action);
        break;
      }
    }
    event.preventDefault();
  }

  for (let action of actions) {
    let a = document.createElement("a");
    a.innerText = action.text;
    a.className = `action-${action.id}`;
    a.dataset.action = action.id;
    a.href = "#";
    container.appendChild(a);
    a.addEventListener("click", processEvent);
  }

  document.body.appendChild(container);
}

document.addEventListener("keypress", (event) => {
  if (event.ctrlKey) {
    for (let action of actions) {
      if (action.keyboard === event.key) {
        log(`Found action for Ctrl+${event.key}: ${action.id}`);
        processAction(action);
        break;
      }
    }
  }
}, false);

createOverlay();

browser.runtime.sendMessage({action: "getVersions"})
  .then((response) => {
    versions = response;
    /* The dev server does not have up to date versions, so this changes them
   * to be ones that might make sense there.
   */
    if (urlObj.host === "bugzilla-dev.allizom.org") {
      versions.FIREFOX_NIGHTLY = "40.0a1";
      versions.LATEST_FIREFOX_DEVEL_VERSION = "39.0b2";
      versions.LATEST_FIREFOX_VERSION = "38.0.1";
    }
  });

browser.runtime.sendMessage({action: "getConfig"})
  .then((response) => {
    userConfig = response;
  });
