import { ConnectionOption } from './../classes/ConnectionOption.js';

export const jsonOptionConnectionOption = new ConnectionOption({
  id: 'code-json',
  fieldsetElementInDom: document.getElementById('code-json')
});

jsonOptionConnectionOption.registerNamedFormElements({
  jsonContent: '#code-area-content',
  copyToClipboardContent: '#copy-to-clipboard-content',
  copyToClipMessage: 'span.copy-clip-message'
});

jsonOptionConnectionOption.registerNamedFormButtons({
  copyToClipboardBtn: '#copy-to-clip-btn'
});

jsonOptionConnectionOption.registerActionOnInput(function({
  elements,
  outputDataToSave
}) {
  const { jsonContent } = elements;
  if (outputDataToSave) {
    const {
      personName,
      personCompany,
      personPosition,
      personProfileUrl
    } = outputDataToSave;
    jsonContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
  <span class="code-line">  <span class="key">"name":</span> <span class="string">"${personName}"</span>,</span>
  <span class="code-line">  <span class="key">"company":</span> <span class="string">"${personCompany}"</span>,</span>
  <span class="code-line">  <span class="key">"position":</span> <span class="string">"${personPosition}"</span>,</span>
  <span class="code-line">  <span class="key">"profile_url":</span> <span class="string">"${personProfileUrl}"</span>,</span>
  <span class="code-line">}</span></code>`;
  } else {
    jsonContent.innerHTML = 'Not valid post data form';
  }
});

// set event listener for 'copy to clipboard button
jsonOptionConnectionOption.invokeFunction(function({
  elements,
  buttons,
  formOutput
}) {
  const { copyToClipboardBtn } = buttons;
  const { jsonContent, copyToClipboardContent, copyToClipMessage } = elements;
  copyToClipboardBtn.addEventListener(
    'click',
    () => {
      copyToClipboardContent.value = jsonContent.textContent;
      copyToClipboardContent.select();
      document.execCommand('copy');
      copyToClipboardContent.blur();

      copyToClipMessage.classList.add('active');
      setTimeout(() => {
        copyToClipMessage.classList.remove('active');
      }, 4000);
    },
    false
  );
});
