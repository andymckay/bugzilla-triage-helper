let userConfig = null;  // eslint-disable-line no-unused-vars
let changeEvent = new UIEvent("change");
let clickEvent = new UIEvent("click");
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);
let bugNumber = params.get("id");
let versions = null;
let newSkin = document.body.classList.contains("bug_modal");

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
    let oldText = comment.value || "";
    comment.value = `${text}${oldText ? "\n\n" : ""}${oldText}`;
    comment.focus();
  },
  flag: function(version, status) {
    let versionNum = roundFirefoxVersion(versions[version]);
    log(`setting Firefox ${versionNum} to ${status}`);

    if (newSkin) {
      if (document.getElementById("module-firefox-tracking-flags-content").style.display === "none") {
        document.getElementById("module-firefox-tracking-flags-header").children[0].dispatchEvent(clickEvent);
      }
    } else {
      if (document.getElementById("edit_tracking_flags_action").className === "bz_default_hidden") {
        document.getElementsByClassName("edit_tracking_flags_link")[0].dispatchEvent(clickEvent);
      }
    }

    let statusElement = document.getElementById(`cf_status_firefox${versionNum}`);
    statusElement.value = status;
    statusElement.dispatchEvent(changeEvent);
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
  },
  submit: function() {
    log("Auto-submitting changes");
    document.getElementById("changeform").submit();
  }
};

function processAction(action) {
  // All the jiggles to get around the modal skin.
  if (newSkin) {
    let mode = document.getElementById("mode-btn");
    var observer = new MutationObserver(changed);

    if (!mode.style.display) {
      mode.dispatchEvent(clickEvent);
      observer.observe(mode, {attributes: true, childList: true});
    } else {
      process(action);
    }
  } else {
    process(action);
  }

  function changed(mutationList) {
    if (mutationList[0].target.disabled) {
      process(action);
      observer.disconnect();
    }
  }

  function process() {
    for (let key of Object.keys(action.events)) {
      let args = action.events[key];
      if (key === "flag") {
        // TODO: would like to move this logic down into flags.
        for (let eachArgs of action.events[key]) {
          eventFunctions[key].apply(null, eachArgs);
        }
      } else {
        eventFunctions[key].apply(null, args);
      }
    }
    if (userConfig.submit) {
      eventFunctions.submit();
    }
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
        log(`Found action for button: ${actionEvent}`);
        processAction(action);
        break;
      }
    }
    event.preventDefault();
  }

  for (let action of actions) {
    let div = document.createElement("div");
    div.className = "action";
    let a = document.createElement("a");
    a.innerText = action.text;
    a.className = `action-${action.id}`;
    a.dataset.action = action.id;
    a.href = "#";

    a.addEventListener("click", processEvent);
    let kbd = document.createElement("span");
    kbd.innerText = `Ctrl+${action.keyboard}`;

    div.appendChild(a);
    div.appendChild(kbd);
    container.appendChild(div);
  }

  let autoCommit = document.createElement("div");
  autoCommit.innerText = "Auto submit: ";

  let autoCommitElement = document.createElement("span");
  autoCommitElement.className = userConfig.submit ? "auto-commit-on" : "auto-commit-off";
  autoCommitElement.innerText = userConfig.submit ? "on" : "off";

  autoCommit.appendChild(autoCommitElement);
  container.appendChild(autoCommit);
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
    createOverlay();
  });
