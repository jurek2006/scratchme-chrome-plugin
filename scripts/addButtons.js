const showMessage = (e) => {
    const element = e.srcElement.offsetParent.offsetParent;

    const authorAndUrl = element.querySelector('.fwn .fcg');
    const timestamp = element.querySelector('._5ptz');

    let time, uTime;

    if (timestamp) {
        time = timestamp.title || '';
        uTime = timestamp.dataset.utime || '';
    } else {
        time = '';
        uTime = '';
    }

    let id = element.id.slice(10, -4);
    const author = authorAndUrl.children[0].textContent || '';
    const url = `${element.baseURI}permalink/${id}`;

    const stripTags = (str) => {
        const reg = /<([^>]+>)/ig;
        return str.replace(reg, '');
    }

    let content = element.querySelector('.userContent').innerHTML || '';
    content = stripTags(content);
    // or const content = element.querySelector('.userContent').textContent || '';


    const dataJSON = JSON.stringify({
        author, url, content, time, uTime
    });

    alert(dataJSON);
    console.log(dataJSON);
}

const addButtons = () => {
    const uiPopovers = document.querySelectorAll('div._6a.uiPopover._5pbi._cmw._b1e');
    console.log('Added buttons');

    [].forEach.call(uiPopovers, (uiPopover) => {
        if (!uiPopover.nextElementSibling && uiPopover.offsetParent) {

            let saveButton = document.createElement("button");
            saveButton.classList.add('scratch-me-btn');
            saveButton.innerText = "ScratchMe";
            saveButton.setAttribute('title', "ScratchMe")
            uiPopover.offsetParent.appendChild(saveButton);

            saveButton.addEventListener('click', showMessage)
        };
    });

    // chrome.runtime.sendMessage({
    //     status: 'Ready',
    //     count: uiPopovers.length
    // });
}

$(document).ready(() => {
    addButtons();
    let timer;

    $(window).scroll(() => {
        if (timer) {
            window.clearTimeout(timer);
        }

        timer = window.setTimeout(addButtons, 500);
    });
});