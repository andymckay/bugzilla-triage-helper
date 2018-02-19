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
  cc: function(action) {
    let bool = action === "no" ? false : true;
    if (newSkin) {
      document.getElementById("add-self-cc").checked = bool;
    } else {
      document.getElementById("addselfcc").checked = bool;
    }
  },
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

    // This ranking mechanism is used to avoid overriding fields which have
    // already been refined by developers.
    let statusRanks = {
      "UNCONFIRMED": 0,
      "NEW" : 1,
      "ASSSIGNED" : 1,
      "RESOLVED": 3
    };

    if (statusRanks[status] > statusRanks[statusElement.value]) {
      statusElement.value = status;
      statusElement.dispatchEvent(changeEvent);
    }

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

function processAction(action, config) {
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

  function process(action) {
    for (let key of Object.keys(action.events)) {
      let args = action.events[key];
      if (key === "flag") {
        // TODO: would like to move this logic down into flags.
        for (let eachArgs of action.events[key]) {
          eventFunctions[key].apply(null, eachArgs);
        }
      } else if (key === "comment" && config.canned) {
        // Insted of the args defined in the config, pass through the canned response.
        let cannedText = canned[userConfig.canned][config.canned]; // eslint-disable-line no-undef
        eventFunctions[key].apply(null, [cannedText]);
      } else {
        eventFunctions[key].apply(null, args);
      }
    }
    if (userConfig.cc !== "default") {
      eventFunctions.cc(userConfig.cc);
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
        processAction(action, {});
        break;
      }
    }
    event.preventDefault();
  }

  function actionEventString(action) {
    let eventString = '';
    for (let key of Object.keys(action.events)) {
      let msg = action.events[key];
      if (msg) {
        msg = msg.join(', ')
        msg = msg.length > 28 ? msg.slice(0, 28) + "..." : msg;
        eventString += ` ${key} → ${msg}\n`;
      }
    }
    return eventString;
  }

  function processCanned(event) {
    let actionEvent = event.target.dataset.parent;
    let cannedMessage = event.target.dataset.canned;

    for (let action of actions) {
      if (action.id === actionEvent) {
        log(`Found action for canned event: ${actionEvent}, message ${cannedMessage}`);
        processAction(action, {canned: cannedMessage});
        break;
      }
    }
    hideCanned(event);
    event.preventDefault();
  }

  function showCanned(event) {
    for (let element of document.getElementsByClassName("canned")) {
      element.style.display = "";
    }
    if (event) {
      event.preventDefault();
    }
  }

  function hideCanned(event) {
    for (let element of document.getElementsByClassName("canned")) {
      element.style.display = "none";
    }
    if (event) {
      event.preventDefault();
    }
  }

  function createCanned(container, action) {
    for (let key of Object.keys(canned[userConfig.canned])) { // eslint-disable-line no-undef
      let canned = document.createElement("div");
      canned.className = "canned";
      canned.style.display = "none";
  
      let a = document.createElement("a");
      a.innerText = key;
      a.dataset.canned = key;
      a.dataset.parent = action.id;
      a.href = "#"; 

      a.addEventListener("click", processCanned);
      
      canned.appendChild(a);
      container.appendChild(canned);
    }
  }

  for (let action of actions) {
    if (action.list === "canned" && !userConfig.canned) {
      continue;
    }
    
    let div = document.createElement("div");
    div.className = "action";
    let a = document.createElement("a");
    a.innerText = action.text;
    a.className = `action-${action.id}`;
    a.dataset.action = action.id;
    a.title = actionEventString(action);
    a.href = "#";

    
    let kbd = document.createElement("span");
    kbd.innerText = `Ctrl+${action.keyboard}`;

    div.appendChild(a);
    div.appendChild(kbd);
    container.appendChild(div);

    if (action.list === "canned") {
      createCanned(container, action);
      a.addEventListener("click", showCanned);
    } else {
      a.addEventListener("click", processEvent);
    }
  }

  function infoElement(infoText, value) {
    let text = document.createElement("div");
    text.className = "info";
    text.innerText = infoText;

    let lookup = {
      true: "on",
      false: "off",
      yes: "on",
      no: "off"
    };
    value = lookup[value] || "unset";
    let element = document.createElement("span");
    element.className = `info-${value}`;
    element.innerText = value;

    text.appendChild(element);
    return text;
  }

  let autoCommit = infoElement("Submit: ", userConfig.submit);
  let ccChange = infoElement("CC: ", userConfig.cc);

  container.appendChild(autoCommit);
  container.appendChild(ccChange);

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

function isLoggedIn() {
  return document.getElementById("login_link_top") === null;
}

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


if (isLoggedIn()) {
  browser.runtime.sendMessage({action: "getConfig"})
    .then((response) => {
      userConfig = response;
      createOverlay();
    });
}