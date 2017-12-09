// ----------------------------

function wontfix() {
  console.log(`[triage-helper:${bugNumber}] in wontfix`);
  insertCommentAndMoveTo("Won't fixing this bug.");
  changeStatus('RESOLVED', 'WONTFIX');
}

function blocker() {
  console.log(`[triage-helper:${bugNumber}] in blocker`);
  changePriority('P1', 'blocker');
  setFlag('LATEST_FIREFOX_VERSION', 'affected');
}

function reset() {
  console.log(`[triage-helper:${bugNumber}] resetting`);
  window.location.reload(true);
}

let actions = [
  {
    text: "Won't fix",
    id: "wontfix",
    func: wontfix
  },
  {
    text: "Blocker",
    id: "blocker",
    func: blocker
  },
  {
    text: "Reset",
    id: "reset",
    func: reset
  }
];

// ----------------------------

let userConfig = null;
let changeEvent = new UIEvent('change');
let clickEvent = new UIEvent('click');
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);
let bugNumber = params.get('id');
let versions = null;
let newSkin = document.body.classList.contains('skin-Mozilla');

function log(msg) {
  console.log(`[triage-helper:${bugNumber}] ${msg}.`);
}

function roundFirefoxVersion(version) {
  return version.split('.')[0];
}

function insertCommentAndMoveTo(text) {
  log(`inserting comment`);
  let comment = document.getElementById('comment');
  comment.value = text;
  comment.focus();
}

function setFlag(version, status) {
  log(`setting ${version}`);
  let versionNum = roundFirefoxVersion(versions[version]);
  let statusElement = document.getElementById(`cf_status_firefox${versionNum}`);
  statusElement.value = status;
  statusElement.dispatchEvent(changeEvent);

  if (newSkin) {
    document.getElementById('module-firefox-tracking-flags-header').children[0].dispatchEvent(clickEvent);
  }
}

function changePriority(priority, severity) {
  log(`changing priority ${priority}`);
  let priorityElement = document.getElementById('priority');
  priorityElement.value = priority;
  priorityElement.dispatchEvent(changeEvent);

  if (severity) {
    let severityElement = document.getElementById('bug_severity');
    severityElement.value = severity;
  }
}

function changeStatus(status, resolution, duplicate) {
  log(`changing status ${status}`);
  let statusElement = document.getElementById('bug_status');
  let resolutionElement = document.getElementById('resolution');
  let duplicateElement = document.getElementById('dup_id');

  statusElement.value = status;
  statusElement.dispatchEvent(changeEvent);

  if (status === 'RESOLVED') {
    resolutionElement.value = resolution;
    resolutionElement.dispatchEvent(changeEvent);
    if (resolutionElement === 'DUPLICATE') {
      duplicateElement.value = duplicate;
    }
  }
}

function createOverlay() {
  let container = document.createElement('div');
  container.id = 'bugzilla-triage-helper';

  let img = document.createElement('img');
  img.src = browser.runtime.getURL('question.svg');
  img.title = 'Bugzilla Triage Helper';
  container.appendChild(img);

  function processEvent(event) {
    let action = event.target.dataset.action;
    log(`processing: ${action}`);
    for (let a of actions) {
      if (a.id === action) {
        let mode = document.getElementById('mode-btn');
        log(mode.style.display);
        if (!mode.style.display) {
          log('changing mode');
          mode.dispatchEvent(clickEvent);
        }
        a.func.apply();
      }
    }
    event.preventDefault();
  }

  for (let action of actions) {
    let a = document.createElement('a');
    a.innerText = action.text;
    a.className = `action-${action.id}`;
    a.dataset.action = action.id;
    a.href = "#";
    container.appendChild(a);
    a.addEventListener("click", processEvent);
  }

  document.body.appendChild(container);
}

createOverlay();

browser.runtime.sendMessage({action: 'getVersions'})
.then((response) => {
  versions = response;
  /* The dev server does not have up to date versions, so this changes them
   * to be ones that might make sense there.
   */
  if (urlObj.host === 'bugzilla-dev.allizom.org') {
    versions.FIREFOX_NIGHTLY = '40.0a1';
    versions.LATEST_FIREFOX_DEVEL_VERSION = '39.0b2';
    versions.LATEST_FIREFOX_VERSION = '38.0.1';
  }
  log(versions);
});

browser.runtime.sendMessage({action: 'getConfig'})
.then((response) => {
  userConfig = response;
});

log('... loaded.');
