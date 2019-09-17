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
    const sysSaveConnectionBtn = document.getElementById('save-connection');
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

        if (e.target.value === 'cooper') {
            sysAccessToken.required = true;
            sysAppName.required = true;
            sysUserAppEmail.required = true;
            sysUserAppEmail.pattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
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

        sysTestConnectionBtn.disabled = true;
        sendFormBtn.disabled = true;

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
        if(sysAccessToken.value && sysAppName.value && sysUserAppEmail.value) {
            sysTestConnectionBtn.disabled = false;
            sendFormBtn.disabled = false;
        }

        // Remove error class to field
        field.classList.remove('error');

        // Remove ARIA role from the field
        field.removeAttribute('aria-describedby');

        // Get field id or name
        const id = field.id || field.name;
        if (!id) return;

        // Check if an error message is in the DOM
        let message = field.form.querySelector('.error-message#error-for-' + id + '');
        if (!message) return;

        // If so, hide it
        message.innerHTML = '';
        message.style.display = 'none';
        message.style.visibility = 'hidden';
    };

    // Listen to all blur events
    scratchMeForm.addEventListener('blur', (e) => {
        // Validate the field
        let error = hasError(e.target);

        // If there's an error, show it
        if (error) {
            showError(e.target, error);
            return;
        }

        // Otherwise, remove any existing error message
        removeError(e.target);

    }, true);

    sendFormBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const fields = scratchMeForm.elements;

        // Validate each field
        // Store the first field with an error to a variable so we can bring it into focus later
        let error, hasErrors;
        for (let i = 0; i < fields.length; i++) {
            error = hasError(fields[i]);
            if (error) {
                showError(fields[i], error);
                if (!hasErrors) {
                    hasErrors = fields[i];
                }
            }
        }

        // If there are errrors, don't submit form and focus on first element with error
        if (hasErrors) {
            event.preventDefault();
            hasErrors.focus();
        }
    });
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', showFormScratchMe);
else
    showFormScratchMe();