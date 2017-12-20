var config = null;
var button = document.querySelectorAll('button')[0]
let urlObj = new URL(window.location);
let params = new URLSearchParams(urlObj.search);

async function setupPage() {
  if (params.get('msg')) {
    document.getElementById(params.get('msg')).style.display = 'block';
  }

  config = await browser.storage.local.get();

  browser.runtime.sendMessage({action: 'getVersions'})
  .then((response) => {
    let text = '';
    for (let key of Object.keys(response)) {
      text += `${key}: ${response[key]}\n`;
    }
    document.getElementById('versions').innerText = text;
  });
  button.disabled = false;
  button.addEventListener('click', processForm);
  document.getElementById('email').value = config.email ? config.email : '';
  document.getElementById('submit').value = config.submit ? 'yes' : 'no';
}

async function processForm(event) {
  event.preventDefault();

  function revertButton() {
    button.innerText = 'Update';
    button.className = 'btn btn-primary';
  }
  config.email = document.getElementById('email').value;
  config.submit = document.getElementById('submit').value === 'yes' ? true : false;
  await browser.storage.local.set(config);

  button.innerText = 'Saved';
  button.className = 'btn btn-success';
  window.setTimeout(revertButton, 1000);
}

setupPage();
