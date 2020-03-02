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
      postId,
      postTitle,
      postAuthor,
      postContent,
      postDatetime,
      postUrl
    } = outputDataToSave;
    jsonContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
  <span class="code-line">  <span class="key">"id":</span> <span class="number">${postId}</span>,</span>
  <span class="code-line">  <span class="key">"title":</span> <span class="string">"${postTitle}"</span>,</span>
  <span class="code-line">  <span class="key">"author":</span> <span class="string">"${postAuthor}"</span>,</span>
  <span class="code-line">  <span class="key">"content":</span> <span class="string">"${postContent}"</span>,</span>
  <span class="code-line">  <span class="key">"date":</span> <span class="string">"${postDatetime}"</span>,</span>
  <span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${postUrl}"</span></span> 
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
