'use strict';

const showMessage = (element) => {
    const timestamp = element.querySelector('._5ptz');
    let time, uTime;

    if (timestamp) {
        time = timestamp.title || '';
        uTime = timestamp.dataset.utime || '';
    } else {
        time = '';
        uTime = '';
    }

    const {origin, pathname} = document.location;

    let url = document.location.origin;
    let postId = Number(element.offsetParent.id.slice(10, -4));

    if(!!postId) {
        url = `${origin}${pathname}permalink/${postId}`;
    }

    const author = element.querySelector('span.fcg a').textContent || '';

    const stripTags = (str) => {
        if(!str) 
            return "";
        else {
            const reg = /<([^>]+>)/ig;
            return str.replace(reg, '');
        }
    }

    let content = element.querySelector('.userContent') || '';
    content = stripTags(content.innerHTML);


    const dataJSON = JSON.stringify({
        author, url, content, time, uTime
    });

    // ####################################
    // It will be changed. This is a temporary solution.
    alert(dataJSON);
    // ####################################
}

const addButtons = () => {
    // const uiPopovers = document.querySelectorAll('._4r_y div._6a.uiPopover._5pbi._cmw._b1e');
    const posts = document.querySelectorAll('._1dwg._1w_m._q7o');

    [].forEach.call(posts, (post) => {
        const uiPopoverParrent = post.querySelector('div._4r_y');

        if (uiPopoverParrent) {

            let saveButton = document.createElement("button");
            saveButton.classList.add('scratch-me-btn');
            saveButton.setAttribute('title', "ScratchMe")
            
            const strongText = document.createElement("strong");
            strongText.innerText = "Scratch";
            strongText.classList.add('strong-text');

            const lightText = document.createTextNode("Me");

            saveButton.appendChild(strongText);
            saveButton.appendChild(lightText);
            uiPopoverParrent.appendChild(saveButton);

            saveButton.addEventListener('click', () => showMessage(post));
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