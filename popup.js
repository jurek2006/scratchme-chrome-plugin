'use strict';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const status = document.getElementById('status');
        status.textContent = "Extension loaded";

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {data: "success"}, (resp) => {
                status.textContent = "Loading...";
                console.log("Success");
            });
        });
    });
})();