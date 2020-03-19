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

const addTopCardButton = () => {
  const buttonClass = 'scratch-me-btn';

  const topCard = document.querySelector('.pv-top-card');

  // if there's no topCard - there is no person LinkedIn data and space to add button
  if (!topCard) return;

  // stop if there's already button in topCard
  const isButtonAlready = !!topCard.querySelector(`.${buttonClass}`);
  if (isButtonAlready) return;

  // create button with handler opening popup & passing profile data (element topCard to extract data from)
  const scratchBtn = createScratchBtn({
    buttonClass,
    domElementToScratch: topCard
  });

  const connectBtn = topCard.querySelector('.pv-s-profile-actions--connect');
  if (!connectBtn) return;

  // for some profiles (e.g. Bill Gates) "connect" button is nested in dropdown (in an element <artdeco-dropdown>)
  const dropdown = connectBtn.closest('artdeco-dropdown');

  // actionBtnsBox is an element containing buttons (in topCard element) "connect", "send message", "more..." (sometimes follow)
  const actionBtnsBox = dropdown
    ? dropdown.parentNode.parentNode.parentNode
    : connectBtn.parentNode.parentNode.parentNode;

  if (actionBtnsBox) {
    actionBtnsBox.insertBefore(scratchBtn, actionBtnsBox.firstElementChild);
  }
};

const addStickyHeaderButton = btn => {
  const buttonClass = 'scratch-me-btn';

  const topCard = document.querySelector('.pv-top-card');
  const stickyHeaderBox = document.querySelector(
    '.pv-profile-sticky-header__actions-container div'
  );

  // if there's no topCard - there is no person LinkedIn data
  // if there's no stkickyHeader Box - page is not scrolled to show sticky header
  if (!topCard || !stickyHeaderBox) return;

  const isButtonAlready = stickyHeaderBox.querySelector(`.${buttonClass}`);
  if (!isButtonAlready) {
    // create button with handler opening popup & passing profile data (element topCard to extract data from)
    const scratchBtn = createScratchBtn({
      buttonClass,
      domElementToScratch: topCard
    });
    stickyHeaderBox.insertBefore(scratchBtn, stickyHeaderBox.firstElementChild);
  }
};

const createScratchBtn = ({ buttonClass, domElementToScratch }) => {
  const scratchButton = document.createElement('button');
  scratchButton.classList.add(buttonClass);
  scratchButton.setAttribute('title', 'ScratchIn');
  const strongText = document.createElement('strong');
  strongText.innerText = 'Scratch';
  strongText.classList.add('strong-text');
  const lightText = document.createTextNode('IN');
  scratchButton.appendChild(strongText);
  scratchButton.appendChild(lightText);
  if (domElementToScratch) {
    scratchButton.addEventListener('click', () =>
      showMessage(domElementToScratch)
    );
  }
  return scratchButton;
};

const addButtons = () => {
  // Does not add a button when pathname does not contain "groups"
  //   const reg = /in/;
  //   if (!reg.test(window.location.pathname)) return;

  addTopCardButton();
  addStickyHeaderButton();
  let timer;

  // sticky header is destroyed if not visible and then recreated again - so adding the button if needed after scroll
  window.addEventListener('scroll', () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      addStickyHeaderButton();
    }, 100);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtons);
} else {
  addButtons();
}
