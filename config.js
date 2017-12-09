browser.runtime.sendMessage({action: 'getVersions'})
.then((response) => {
  let text = '';
  for (let key of Object.keys(response)) {
    text += `${key}: ${response[key]}\n`;
  }
  document.getElementById('versions').innerText = text;
});

var config = null;
browser.storage.local.get()
.then(data => {
  config = data;
  for (let element of document.querySelectorAll('input')) {
    element.addEventListener('click', processForm);
    element.checked = config[element.dataset.key] || false;
  }
});

function processForm(event) {
  if (event.target.checked) {
    config[event.target.dataset.key] = true;
  } else {
    config[event.target.dataset.key] = false;
  }
  browser.storage.local.set(config);
}
