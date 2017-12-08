browser.runtime.sendMessage({action: 'getVersions'})
.then((response) => {
  let text = '';
  for (let key of Object.keys(response)) {
    text += `${key}: ${response[key]}\n`;
  }
  document.getElementById('versions').innerText = text;
});
