chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("something happening from the extension");
    const data = request.data || {};

    // const userContentWrappers = document.querySelectorAll('div.userContentWrapper');
    const uiPopovers = document.querySelectorAll('div._6a.uiPopover._5pbi._cmw._b1e');

    const showMessage = () => {
        alert("Jakieś dane");
    }
    
    [].forEach.call(uiPopovers, function (uiPopover) {
        if(!uiPopover.nextElementSibling && uiPopover.offsetParent) {

            let saveButton = document.createElement("button");
            saveButton.setAttribute("style", "position: absolute; top: 0; right: 35px; background-color: #fff; border: 2px solid #eee; color: #616770; width: 80px; padding: 5px; margin-top: 5px; cursor: pointer");
            saveButton.innerText = "Save post";
            uiPopover.offsetParent.appendChild(saveButton);

            saveButton.addEventListener('click', showMessage)
        };
    });

    sendResponse({ data, success: true });
});