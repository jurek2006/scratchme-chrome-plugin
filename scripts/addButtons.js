const showMessage = function () {
    alert("Show data");
}

const addButtons = function () {
    const uiPopovers = document.querySelectorAll('div._6a.uiPopover._5pbi._cmw._b1e');
    console.log('Added buttons');

    [].forEach.call(uiPopovers, function (uiPopover) {
        if (!uiPopover.nextElementSibling && uiPopover.offsetParent) {

            let saveButton = document.createElement("button");
            saveButton.classList.add('scratch-me-btn');
            saveButton.innerText = "ScratchMe";
            saveButton.setAttribute('title', "ScratchMe")
            uiPopover.offsetParent.appendChild(saveButton);

            saveButton.addEventListener('click', showMessage)
        };
    });
}

$(document).ready(function () {
    addButtons();
    let timer;

    $(window).scroll(function () {
        if (timer) {
            window.clearTimeout(timer);
        }

        timer = window.setTimeout(addButtons, 500);
    });
});