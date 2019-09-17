'use strict';

// chrome.storage.onChanged.addListener((changes, namespace) => {
//     console.log('Zmiana storage');
// });

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Form
        const scratchMeForm = document.getElementById('scratch-me-form');

        // Facebook data
        const postAuthorInput = document.getElementById('post-author');
        const postDatetimeInput = document.getElementById('post-datetime');
        const postTitleInput = document.getElementById('post-title');
        const postContentTextarea = document.getElementById('post-content');
        const postUrlInput = document.getElementById('post-url');
        const postIdInput = document.getElementById('post-id');

        // Select and display format e.g JSON/Cooper/Curl
        const selectDataFormat = document.getElementById('select-data-format');
        const codeArea = document.getElementById('code-area');
        const codeAreaTextarea = document.getElementById('code-area-textarea');

        // System CRM data
        const sysAccessToken = document.getElementById('access-token');
        const sysAppName = document.getElementById('application-name');
        const sysUserAppEmail = document.getElementById('user-application-email');

        // Buttons
        const sysConfigureConnectionBtn = document.getElementById('configure-connection');
        const sysTestConnectionBtn = document.getElementById('test-connection');
        const sendFormBtn = document.getElementById('send-form');

        const setDateTimeValue = (unixTime) => {
            const date = new Date(unixTime * 1000);

            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const dayMonth = ("0" + date.getDate()).slice(-2);
            const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

            return `${date.getFullYear()}-${month}-${dayMonth}T${date.getHours()}:${minutes}`
        };

        const setInputsValue = (postData) => {
            const { postId, author, url, content, time, uTime } = postData;

            postAuthorInput.value = author;
            postDatetimeInput.value = setDateTimeValue(uTime);
            postTitleInput.value = `${postId ? postId + " - " : ""}${content.slice(0, 15)}... - ${author}`;
            postContentTextarea.value = content;
            postUrlInput.value = url;
            postIdInput.value = postId || "0";
        }

        chrome.storage.sync.get(['postData'], (storage) => {
            setInputsValue(storage.postData);
        });

        selectDataFormat.addEventListener('change', (e) => {
            const contentOfSelectedOption = document.querySelectorAll('.content-of-selected-option');

            for (const content of contentOfSelectedOption)
                content.classList.add('disabled');

            const selectedContent = document.getElementById(e.target.value);
            if (selectedContent)
                selectedContent.classList.remove('disabled');
        })
    });
})();