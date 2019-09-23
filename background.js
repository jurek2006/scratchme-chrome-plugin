chrome.runtime.onMessage.addListener((req, sender) => {

    if (req.isClickedButton) {
        chrome.browserAction.setBadgeText({ text: 'New' });


        chrome.windows.create({
            url: chrome.extension.getURL("popup_form.html"),
            type: "popup",
            top: 10,
            left: 10,
            width: 435,
            height: 700
        });

        setTimeout(() => {
            chrome.browserAction.setBadgeText({ text: '' });
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