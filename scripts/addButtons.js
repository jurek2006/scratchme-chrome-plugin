'use strict';

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


    const dataJSON = JSON.stringify({
        author, url, content, time, uTime
    });

    // ####################################
    // It will be changed. This is a temporary solution.
    alert(dataJSON);
    // ####################################
}

const addButtons = () => {
    const uiPopovers = document.querySelectorAll('._4r_y div._6a.uiPopover._5pbi._cmw._b1e');

    [].forEach.call(uiPopovers, (uiPopover) => {
        if (!uiPopover.nextElementSibling && uiPopover.offsetParent) {

            let saveButton = document.createElement("button");
            saveButton.classList.add('scratch-me-btn');
            saveButton.setAttribute('title', "ScratchMe")
            
            const strongText = document.createElement("strong");
            strongText.innerText = "Scratch";
            strongText.classList.add('strong-text');

            const lightText = document.createTextNode("Me");

            saveButton.appendChild(strongText);
            saveButton.appendChild(lightText);
            uiPopover.offsetParent.appendChild(saveButton);

            saveButton.addEventListener('click', showMessage)
        };
    });

    // ####################################
    // TODO it will be used in the future
    // chrome.runtime.sendMessage({
    //     status: 'Ready',
    //     count: uiPopovers.length
    // });
    // ####################################
}

const scrollWindow = () => {
    addButtons();
    let timer;

    window.addEventListener('scroll', () => {
        if (timer) {
            window.clearTimeout(timer);
        }

        timer = window.setTimeout(addButtons, 100);
    });
}


if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', scrollWindow);
else
    scrollWindow();