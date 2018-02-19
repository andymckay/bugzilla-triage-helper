let userConfig = null;  // eslint-disable-line no-unused-vars
let changeEvent = new UIEvent("change");
let clickEvent = new UIEvent("click");
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);
let bugNumber = params.get("id");
let versions = null;
let product = null;
let component = null;
let newSkin = document.body.classList.contains("bug_modal");

function log(msg) {
  console.log(`[triage-helper:${bugNumber}] ${msg}.`); // eslint-disable-line no-console
}

function roundFirefoxVersion(version) {
  return version.split(".")[0];
}

let eventFunctions = {
  blocking: function(bug) {
    log("adding blocking bug");
    let value = document.getElementById('blocked').value;
    if (!value.includes(bug)) {
      document.getElementById('blocked').value = `${value} ${bug}`;
    }
  },
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
  },
  whiteboard: function(text) {
    log('adding to the whiteboard');
    let value = document.getElementById('status_whiteboard').value;
    if (!value.includes(text)) {
      document.getElementById('status_whiteboard').value = `${value} ${text}`;
    }
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

  function process(events) {
    for (let key of Object.keys(events)) {
      let args = events[key];
      if (key === "flag") {
        // TODO: would like to move this logic down into flags.
        for (let eachArgs of events[key]) {
          eventFunctions[key].apply(null, eachArgs);
        }
      } else {
        eventFunctions[key].apply(null, args);
      }
    }
    if (userConfig.cc !== "default") {
      eventFunctions.cc(userConfig.cc);
    }
  }
}

function showAdditional(event) {
  hideAdditional(event);
  let start = event.target.parentNode;
  let startActionId = event.target.dataset.action;

  function getNext(node) {
    let element = node.nextSibling;
    if (element.firstChild.dataset.parent === startActionId) {
      element.style.display = "";
      getNext(element);
    }
  }

  getNext(start);
  if (event) {
    event.preventDefault();
  }
}

function hideAdditional(event) {
  for (let element of document.getElementsByClassName("additional")) {
    element.style.display = "none";
  }
  if (event) {
    event.preventDefault();
  }
}

function getAdditionalKey(action) {
  return `${product}|${component}|${action.id}`;
}

function actionEventString(events) {
  let eventString = "";
  if (events) {
    for (let key of Object.keys(events)) {
      let msg = events[key];
      if (msg) {
        msg = msg.join(", ");
        msg = msg.length > 28 ? msg.slice(0, 28) + "..." : msg;
        eventString += ` ${key} → ${msg}\n`;
      }
    }
  } else {
    eventString += "No actions.";
  }
  return eventString;
}

function createAdditional(container, action, additional, additionalKey) {
  for (let key of Object.keys(additional)) {
    let addElement = document.createElement("div");
    addElement.className = "additional";
    addElement.style.display = "none";

    let a = document.createElement("a");
    a.innerText = key;
    a.dataset.additional = key;
    a.dataset.additionalKey = additionalKey;
    a.dataset.parent = action.id;
    a.title = actionEventString(additional[key]);
    a.href = "#"; 

    a.addEventListener("click", processAdditional);
    
    addElement.appendChild(a);
    container.appendChild(addElement);
  }
}

function processEvent(event) {
  let actionEvent = event.target.dataset.action;

  for (let action of actions) {
    if (action.id === actionEvent) {
      log(`Found action for button: ${actionEvent}`);
      processAction(action.events);
      break;
    }
  }
  event.preventDefault();
}

function processAdditional(event) {
  let actionEvent = event.target.dataset.parent;
  let additionalAction = event.target.dataset.additional;
  let additionalKey = event.target.dataset.additionalKey;

  for (let action of actions) {
    if (action.id === actionEvent) {
      log(`Found action for button: ${actionEvent}`);
      processAction(action.events);
      log(`Found action for additional event: ${additionalAction}`);
      processAction(additionalEvents[additionalKey][additionalAction]); // eslint-disable-line no-undef
      if (userConfig.submit) {
        eventFunctions.submit();
      }
      break;
    }
  }
  hideAdditional(event);
  event.preventDefault();
}

function createOverlay() {
  let container = document.createElement("div");
  container.id = "bugzilla-triage-helper";

  let img = document.createElement("img");
  img.src = browser.runtime.getURL("question.svg");
  img.title = "Bugzilla Triage Helper";
  container.appendChild(img);

  for (let action of actions) {
    let additionalKey = getAdditionalKey(action);
    let additional = additionalEvents[additionalKey];  // eslint-disable-line no-undef

    // Don't show a button if there's no events and no additional events.
    if (!action.events && !additional) {
      log(`Skipping action: ${action.id} no events to process.`);
      continue;
    }
    
    let div = document.createElement("div");
    div.className = "action";
    let a = document.createElement("a");
    a.id = `bugzilla-triage-helper-${action.id}`;
    a.innerText = action.text;
    a.className = `action-${action.id}`;
    a.dataset.action = action.id;
    a.title = actionEventString(action.events);
    a.href = "#";
    
    let kbd = document.createElement("span");
    kbd.innerText = `Ctrl+${action.keyboard}`;

    div.appendChild(a);
    div.appendChild(kbd);
    container.appendChild(div);
 
    if (additional) {
      createAdditional(container, action, additional, additionalKey);
      a.addEventListener("click", showAdditional);
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
        document.getElementById(`bugzilla-triage-helper-${action.id}`).dispatchEvent(clickEvent);
        break;
      }
    }
  }
  event.preventDefault();
}, false);

function isLoggedIn() {
  return document.getElementById("login_link_top") === null;
}

function getProductComponent() {
  if (newSkin) {
    product = document.getElementById("product-name").textContent.trim();
    component = document.getElementById("component-name").textContent.trim();
  } else {
    product = document.getElementById("product").value;
    component = document.getElementById("component").value;
  }
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
  log("Logged in, creating overlay");
  browser.runtime.sendMessage({action: "getConfig"})
    .then((response) => {
      userConfig = response;
      getProductComponent();
      createOverlay();
    });
}