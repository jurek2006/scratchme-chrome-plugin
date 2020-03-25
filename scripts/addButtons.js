'use strict';

const showMessage = element => {
  const url = document.location.href;
  const name = element
    .querySelector('.pv-top-card--list li.t-24')
    .textContent.trim();

  const company = element
    .querySelector('[data-control-name="position_see_more"] span')
    .textContent.trim();

  const position = element.querySelector('h2.t-18').textContent.trim();

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

  // targetBtn helps to get element where to insert scratchBtn
  // for not-connected person profile it is "connect" button, for connected person profile "message" button
  const targetBtn =
    topCard.querySelector('.pv-s-profile-actions--connect') ||
    topCard.querySelector('.pv-s-profile-actions--message');
  if (!targetBtn) return;

  // for some profiles (e.g. Bill Gates) "connect" button is nested in dropdown (in an element <artdeco-dropdown>)
  const dropdown = targetBtn.closest('artdeco-dropdown');

  // actionBtnsBox is an element containing buttons (in topCard element) "connect", "send message", "more..." (sometimes follow)
  const actionBtnsBox = dropdown
    ? dropdown.parentNode.parentNode.parentNode
    : targetBtn.parentNode.parentNode.parentNode;

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
  // add classes from LinkedIn
  scratchButton.classList.add(
    'artdeco-button',
    'artdeco-button--2',
    'artdeco-button--primary'
  );
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
      // top card element is created just once (when LinkedIn page is being created)
      // after clicking other person profile page is usually not rerendered, thus when previous profile didn't have button added - opened one won't have it
      // calling addTopCardButton() here solves the issue
      addTopCardButton();
      addStickyHeaderButton();
    }, 100);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtons);
} else {
  addButtons();
}
