chrome.runtime.onStartup.addListener(() => {
    chrome.browserAction.setPopup({ popup: 'popup_without_form.html' }, (details) => {
        console.log(details);
    });
});

chrome.runtime.onMessage.addListener((req, sender) => {

    if (req.isClickedButton) {
        chrome.browserAction.setPopup({ popup: 'popup.html' });
        chrome.browserAction.setBadgeText({text: 'New'});

        setTimeout(() => {
            chrome.browserAction.setBadgeText({text: ''});
        }, 5000);

        const { postId, author, url, content, time, uTime } = req;

        chrome.storage.sync.set({
            postData: {
                postId, author, url, content, time, uTime
            }
        }, () => {
            console.log('Data was saved to local.sync');
        });
    }
});