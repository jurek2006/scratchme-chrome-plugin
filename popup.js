'use strict';

// chrome.storage.onChanged.addListener((changes, namespace) => {
//     console.log('Zmiana storage');
// });

const showFormScratchMe = () => {
    // Form
    const scratchMeForm = document.getElementById('scratch-me-form');
    // scratchMeForm.setAttribute('novalidate', true);

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
        const date = unixTime ? new Date(unixTime * 1000) : new Date(Date.now());

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

        if(e.target.value === 'cooper') {
            sysAccessToken.required = true;
            sysAppName.required = true;
            sysUserAppEmail.required = true;
            sysUserAppEmail.pattern = "^([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x22([^\\x0d\\x22\\x5c\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x22)(\\x2e([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x22([^\\x0d\\x22\\x5c\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x22))*\\x40([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x5b([^\\x0d\\x5b-\\x5d\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x5d)(\\x2e([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x5b([^\\x0d\\x5b-\\x5d\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x5d))*(\\.\w{2,})+$";
        } else {
            sysAccessToken.required = false;
            sysAppName.required = false;
            sysUserAppEmail.required = false;
            sysUserAppEmail.removeAttribute('pattern');
        }
    });



    const hasError = (field) => {
        // Don't validate submits, buttons, file and reset inputs, and disabled fields
        if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

        const validity = field.validity;

        if (validity.valid) return;

        // If field is required and empty
        if (validity.valueMissing) return 'Please fill out this field.';

        // If not the right type
        if (validity.typeMismatch) {
            if (field.type === 'email') return 'Please enter an email address.';
            if (field.type === 'url') return 'Please enter a URL.';
        }

        // If too short
        if (validity.tooShort) return 'Please lengthen this text to ' + field.getAttribute('minLength') + ' characters or more. You are currently using ' + field.value.length + ' characters.';

        // If too long
        if (validity.tooLong) return 'Please shorten this text to no more than ' + field.getAttribute('maxLength') + ' characters. You are currently using ' + field.value.length + ' characters.';

        // If number input isn't a number
        if (validity.badInput) return 'Please enter a number.';

        // If pattern doesn't match
        if (validity.patternMismatch) {

            // If pattern info is included, return custom error
            if (field.hasAttribute('title')) return field.getAttribute('title');

            // Otherwise, generic error
            return 'Please match the requested format.';
        }

        // If all else fails, return a generic catchall error
        return 'The value you entered for this field is invalid.';
    };

    // Show an error message
    const showError = (field, error) => {

        // Add error class to field
        field.classList.add('error');

        // Get field id or name
        const id = field.id || field.name;
        if (!id) return;

        // Check if error message field already exists
        // If not, create one
        let message = field.form.querySelector('.error-message#error-for-' + id);
        if (!message) {
            message = document.createElement('div');
            message.className = 'error-message';
            message.id = 'error-for-' + id;

            // Otherwise, insert it after the field
            let label;

            if (!label) {
                field.parentNode.insertBefore(message, field.nextSibling);
            }
        }

        // Add ARIA role to the field
        field.setAttribute('aria-describedby', 'error-for-' + id);

        // Update error message
        message.innerHTML = error;

        // Show error message
        message.style.display = 'block';
        message.style.visibility = 'visible';

    };

    // Remove the error message
    const removeError = (field) => {

        // Remove error class to field
        field.classList.remove('error');

        // Remove ARIA role from the field
        field.removeAttribute('aria-describedby');

        // Get field id or name
        var id = field.id || field.name;
        if (!id) return;

        // Check if an error message is in the DOM
        var message = field.form.querySelector('.error-message#error-for-' + id + '');
        if (!message) return;

        // If so, hide it
        message.innerHTML = '';
        message.style.display = 'none';
        message.style.visibility = 'hidden';
    };

    // Listen to all blur events
    document.addEventListener('blur', function (event) {
        // Only run if the field is in a form to be validated
        if (!event.target.form.classList.contains('validate')) return;

        // Validate the field
        var error = hasError(event.target);

        // If there's an error, show it
        if (error) {
            showError(event.target, error);
            return;
        }

        // Otherwise, remove any existing error message
        removeError(event.target);

    }, true);
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', showFormScratchMe);
else
    showFormScratchMe();