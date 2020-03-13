'use strict';

const showMessage = element => {
  //   const timestamp = element.querySelector('._5ptz');
  //   let time, uTime;

  //   if (timestamp) {
  //     time = timestamp.title || '';
  //     uTime = timestamp.dataset.utime || '';
  //   } else {
  //     time = '';
  //     uTime = '';
  //   }

  //   const { origin, pathname } = document.location;

  //   let url = document.location.origin;
  const url = document.location.href;
  const name = element
    .querySelector('.pv-top-card--list li.t-24')
    .textContent.trim();

  const company = element
    .querySelector('[data-control-name="position_see_more"] span')
    .textContent.trim();

  const position = element.querySelector('h2.t-18').textContent.trim();

  console.log({ url, name, company, position });
  //   let postId = Number(element.offsetParent.id.slice(10, -4));

  //   if (!!postId) {
  //     url = `${origin}${pathname}permalink/${postId}`;
  //   }

  //   const author = element.querySelector('span.fcg a').textContent || '';

  //   const stripTags = str => {
  //     if (!str) {
  //       return '';
  //     } else {
  //       const reg = /<([^>]+>)/gi;
  //       return str.replace(reg, '');
  //     }
  //   };

  //   let content = element.querySelector('.userContent') || '';
  //   content = stripTags(content.innerHTML);

  // Save data to background.js. The data are save in background and read in popup.js
  chrome.runtime.sendMessage({
    isClickedButton: true,
    name,
    company,
    position,
    url
  });
};

const addButtons = () => {
  // Does not add a button when pathname does not contain "groups"
  //   const reg = /in/;
  //   if (!reg.test(window.location.pathname)) return;

  const box = document.querySelector('#ember65');
  const topCard = document.querySelector('.pv-top-card');

  console.log(box);
  if (box && topCard) {
    const saveButton = document.createElement('button');
    saveButton.classList.add('scratch-me-btn');
    saveButton.setAttribute('title', 'ScratchMe');
    const strongText = document.createElement('strong');
    strongText.innerText = 'Scratch';
    strongText.classList.add('strong-text');
    const lightText = document.createTextNode('IN');
    saveButton.appendChild(strongText);
    saveButton.appendChild(lightText);
    console.log('adding', saveButton);
    box.appendChild(saveButton);
    saveButton.addEventListener('click', () => showMessage(topCard));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtons);
} else {
  addButtons();
}
