'use strict';

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const status = document.getElementById('status');
        status.textContent = "Extension loaded";

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: "success"}, function(resp) {
                status.textContent = "Loading...";
                console.log("Success");
            });
        });
    });
})();