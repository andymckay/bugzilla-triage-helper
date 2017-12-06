function wontfix() {
  console.log('[triage-helper] in wontfix');
  insertCommentAndMoveTo("Won't fix this baby");
}

function investigate() {
  console.log('[triage-helper] in investigate');
}

function insertCommentAndMoveTo(text) {
  console.log('[triage-helper] grabbing comment');
  document.getElementById('comment').value = text;
}

function createOverlay() {
  let container = document.createElement('div');
  container.id = 'bugzilla-triage-helper';
  container.style.display = 'none';

  let img = document.createElement('img');
  img.src = browser.runtime.getURL('question.svg');
  container.appendChild(img);

  let actions = [
    {
      text: "Won't fix",
      id: "wontfix"
    },
    {
      text: "Investigate",
      id: "investigate"
    }
  ]

  function processEvent(event) {
    let action = event.target.dataset.action;
    console.log('[triage-helper] processing:', action);
    if (action === 'wontfix') {
      wontfix();
    }
    if (action === 'investigate') {
      investigate();
    }
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

function showOverlay() {
  document.getElementById('bugzilla-triage-helper').style.display = 'block';
}

function hideOverlay() {
  document.getElementById('bugzilla-triage-helper').style.display = 'none';
}

function handler(request, sender) {
  createOverlay();
  console.log('[triage-helper] setting overlay to:', request.show);
  if (request.show === true) {
    showOverlay();
  }
  if (request.show === false) {
    hideOverlay();
  }
}

browser.runtime.onMessage.addListener(handler);


