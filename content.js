// ----------------------------

function wontfix() {
  console.log(`[triage-helper:${bugNumber}] in wontfix`);
  insertCommentAndMoveTo("Won't fixing this bug.");
  changeStatus('RESOLVED', 'WONTFIX');
}

function blocker() {
  console.log(`[triage-helper:${bugNumber}] in blocker`);
  changePriority('P1', 'blocker');
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
    text: "P1 Blocker",
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

let changeEvent = new UIEvent('change');
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);
let bugNumber = params.get('id');
let versions = null;

function insertCommentAndMoveTo(text) {
  console.log(`[triage-helper:${bugNumber}] inserting comment`);
  let comment = document.getElementById('comment');
  comment.value = text;
  comment.focus();
}

function changePriority(priority, severity) {
  console.log(`[triage-helper:${bugNumber}] changing priority`);
  let priorityElement = document.getElementById('priority');
  priorityElement.value = priority;
  priorityElement.dispatchEvent(changeEvent);

  if (severity) {
    let severityElement = document.getElementById('bug_severity');
    severityElement.value = severity;
  }
}

function changeStatus(status, resolution, duplicate) {
  console.log(`[triage-helper:${bugNumber}] changing status`);
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
    console.log(`[triage-helper:${bugNumber}] processing: ${action}`);
    for (let a of actions) {
      if (a.id === action) {
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
});
