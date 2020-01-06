'use strict';

const showFormScratchMe = () => {
    const popup = document.querySelector('.popup');

    // Form
    const scratchMeForm = document.getElementById('scratch-me-form');

    // Facebook data
    const postAuthorInput = document.getElementById('post-author');
    const postDatetimeInput = document.getElementById('post-datetime');
    const postTitleInput = document.getElementById('post-title');
    const postContentTextarea = document.getElementById('post-content');
    const postUrlInput = document.getElementById('post-url');
    const postIdInput = document.getElementById('post-id');

    // Select and display format e.g JSON/copper/cURL
    const selectDataFormat = document.getElementById('select-data-format');
    const codeAreaContent = document.getElementById('code-area-content');

    // System CRM data
    const sysAccessTokenInput = document.getElementById('access-token');
    const sysAppNameInput = document.getElementById('application-name');
    const sysUserAppEmailInput = document.getElementById('user-application-email');
    const selectPipeline = document.getElementById('select-pipeline');
    const copperDataWrapper = document.getElementById('copper-data-wrapper');
    const copperConectionWrapper = document.getElementById('copper-connection-wrapper');

    // Buttons
    const sysSaveConnectionBtn = document.getElementById('save-connection');
    const sysTestConnectionBtn = document.getElementById('test-connection');
    const sendFormBtn = document.getElementById('send-form');
    const copyToClipBtn = document.getElementById('copy-to-clip-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const editConnectionBtn = document.getElementById('edit-connection');

    // ArrayData
    let primaryContactID = [];


    chrome.storage.sync.get(['postData'], (storage) => {
        setFieldsValue(storage.postData);
    });

    // Get headers for request to copper
    const getHeaders = () => {
        const headers = {
            'X-PW-AccessToken': sysAccessTokenInput.value,
            'X-PW-Application': sysAppNameInput.value,
            'X-PW-UserEmail': sysUserAppEmailInput.value,
            'Content-Type': 'application/json',
        };

        return headers;
    }


    const copyToClipboard = (e) => {
        e.preventDefault();

        const copyToClipContent = document.getElementById('copy-to-clipboard-content');
        const copyToClipMessage = document.querySelector('span.copy-clip-message');
        copyToClipContent.value = codeAreaContent.textContent;

        copyToClipContent.select();
        document.execCommand("copy");
        copyToClipContent.blur();

        copyToClipMessage.classList.add('active');
        setTimeout(() => {
            copyToClipMessage.classList.remove('active');
        }, 4000);

    };


    const clearExtractedData = (e) => {
        if (e) e.preventDefault();

        try {
            chrome.storage.sync.remove(['postData'], (items) => {
                postAuthorInput.value = "";
                postContentTextarea.value = "";
                postDatetimeInput.value = "";
                postIdInput.value = "";
                postUrlInput.value = "";
                postTitleInput.value = "";
                codeAreaContent.innerHTML = "";
            });
        } catch (error) {
            console.log('Error: ' + error);
        }
    }


    const setDateTimeValue = (unixTime) => {
        const date = unixTime ? new Date(unixTime * 1000) : new Date(Date.now());

        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const dayMonth = ("0" + date.getDate()).slice(-2);
        const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
        const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

        return `${date.getFullYear()}-${month}-${dayMonth}T${hours}:${minutes}`
    };



    const setFieldsValue = (postData) => {
        if (!postData) return;

        const { postId, author, url, content, uTime } = postData;

        postAuthorInput.value = author;
        postDatetimeInput.value = setDateTimeValue(uTime);
        postTitleInput.value = `${content.slice(0, 20)}... - ${author}`;
        postContentTextarea.value = `${url} - ${content}`;
        postUrlInput.value = url;
        postIdInput.value = postId || "0";
    }


    const getMessageElement = (id, targetElem) => {

        let messageElem = targetElem.form.querySelector('.result-message#message-for-' + id);

        if (!messageElem) {
            messageElem = document.createElement('div');
            messageElem.className = 'result-message';
            messageElem.id = 'message-for-' + id;

            // Otherwise, insert it after the field
            let label;
            if (!label) {
                targetElem.parentNode.insertBefore(messageElem, targetElem.parent);
            }
        }

        return messageElem;
    }

    const showItemMessage = (messageElem, text, itemClassName, disabledElem, isDisable) => {
        messageElem.classList.add(itemClassName);
        messageElem.innerHTML = text;
        disabledElem.disabled = isDisable;

        // Show error message
        messageElem.style.display = 'block';
        messageElem.style.visibility = 'visible';

        setTimeout(() => {
            messageElem.innerHTML = '';
            messageElem.style.display = 'none';
            messageElem.style.visibility = 'hidden';
        }, 5000);
    }



    const generateCode = (codeName) => {
        const data = {
            postId: postIdInput.value,
            postTitle: postTitleInput.value,
            author: postAuthorInput.value,
            content: postContentTextarea.value,
            datetime: postDatetimeInput.value,
            postUrl: postUrlInput.value
        };

        // Copy to clipboard
        copyToClipBtn.addEventListener('click', copyToClipboard, false);

        switch (codeName) {
            case 'json':
                codeAreaContent.innerHTML =
                    `<code class="json-language"><span class="code-line">{</span>
<span class="code-line">  <span class="key">"id":</span> <span class="number">${postIdInput.value}</span>,</span>
<span class="code-line">  <span class="key">"title":</span> <span class="string">"${postTitleInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"author":</span> <span class="string">"${postAuthorInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"content":</span> <span class="string">"${postContentTextarea.value}"</span>,</span>
<span class="code-line">  <span class="key">"date":</span> <span class="string">"${postDatetimeInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${postUrlInput.value}"</span></span>
<span class="code-line">}</span></code>`

                break;

            case 'curl':
                codeAreaContent.innerHTML =
                    `<code class="curl-language"><span class="code-line">curl --location --request <span class="method">GET</span><span class="value">"https://api.prosperworks.com/developer_api/v1/account"</span><span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-AccessToken: ${sysAccessTokenInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-Application: ${sysAppNameInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-UserEmail: ${sysUserAppEmailInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"Content-Type: application/json"</span></span></code>`;
                break;
        }
    }



    const hasError = (field) => {
        // Don't validate submits, buttons, file and reset inputs, and disabled fields
        if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

        sysTestConnectionBtn.disabled = true;

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
        if (sysAccessTokenInput.value && sysAppNameInput.value && sysUserAppEmailInput.value) {
            sysTestConnectionBtn.disabled = false;
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


    // Validates and checks that form fields are correct. Return the first field with an arror.
    const isTheFormCorrect = () => {
        // Validate each field
        // Store the first field with an error to a variable so we can bring it into focus later
        const fields = scratchMeForm.elements;
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

        return hasErrors;
    }


    // Listen to all input event
    const handleInputEvent = (e) => {
        // Validate the field
        let error = hasError(e.target);

        // Button disabled when the form is incorrect
        sendFormBtn.disabled = Boolean(isTheFormCorrect());

        // If there's an error, show it
        if (error) {
            showError(e.target, error);
            return;
        }

        // Otherwise, remove any existing error message
        removeError(e.target);
    }


    const handleChangeSelectFormat = (e) => {

        const targetValue = e.target.value;
        const contentOfSelectedOption = document.querySelectorAll('.content-of-selected-option');

        for (const content of contentOfSelectedOption)
            content.classList.add('disabled');


        const selectedContent = document.getElementById(`${targetValue.slice(0, 4) === 'code' ? 'code-area' : targetValue}`);

        if (selectedContent)
            selectedContent.classList.remove('disabled');

        if (targetValue === 'copper') {

            sysAccessTokenInput.required = true;
            sysAppNameInput.required = true;
            sysUserAppEmailInput.required = true;
            sysUserAppEmailInput.pattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

            const retrievedObject = localStorage.getItem('systemConnectionData');
            const connectionData = JSON.parse(retrievedObject);

            if (connectionData) {
                sysAccessTokenInput.value = connectionData['X-PW-AccessToken'];
                sysAppNameInput.value = connectionData['X-PW-Application'];
                sysUserAppEmailInput.value = connectionData['X-PW-UserEmail'];
                sysTestConnectionBtn.disabled = false;

                fetchCompanyID();
                fetchPipelines();
            } else {
                copperDataWrapper.style.display = 'none';
                copperConectionWrapper.classList.remove('disabled');
            }

        } else if (targetValue.slice(0, 4) === 'code') {
            generateCode(targetValue.slice(5));

        } else {

            sysAccessTokenInput.required = false;
            sysAppNameInput.required = false;
            sysUserAppEmailInput.required = false;
            sysUserAppEmailInput.removeAttribute('pattern');

        }
    }

    const handleClickTestConnection = (e) => {
        e.preventDefault();
        let messageElem = getMessageElement('test-connection', e.target);

        const url = 'https://api.prosperworks.com/developer_api/v1/account';
        const headers = getHeaders();

        fetch(url, {
            method: 'GET',
            headers: headers
        }).then(resp => {
            if (resp.ok) {
                showItemMessage(messageElem, 'Connection success', 'success-message', sysSaveConnectionBtn, false);
                return resp.json();
            } else {
                return Promise.reject(resp);
            }
        }).then(data => {
            const acoundDetailData = {
                'company_id': data.id,
                'company_name': data.name
            };

            try {
                localStorage.setItem('acoundDetailData', JSON.stringify(acoundDetailData));
            } catch (error) {
                console.log('Error: ' + error);
            } finally {
                copperDataWrapper.style.display = "block";
            };

            fetchPipelines();
        }).catch(error => {
            sendFormBtn.disabled = false;
            if (error.status === 429) {
                showItemMessage(messageElem, '429 - Too Many Requests', 'error-message', sysSaveConnectionBtn, true);
            } else if (error.status === 401) {
                showItemMessage(messageElem, '401 - Unauthorized', 'error-message', sysSaveConnectionBtn, true);
            } else if (error.status === 500) {
                showItemMessage(messageElem, '500 - Internal Server Error', 'error-message', sysSaveConnectionBtn, true);
            } else {
                showItemMessage(messageElem, 'Connection failed', 'error-message', sysSaveConnectionBtn, true);
            }
            copperDataWrapper.style.display = "none";
            console.error('Error:', error);
        });
    }


    const handleClickSaveConnection = (e) => {
        e.preventDefault();

        const systemConnectionData = {
            'X-PW-AccessToken': sysAccessTokenInput.value,
            'X-PW-Application': sysAppNameInput.value,
            'X-PW-UserEmail': sysUserAppEmailInput.value
        };

        try {
            localStorage.setItem('systemConnectionData', JSON.stringify(systemConnectionData));
        } catch (error) {
            console.log('Error: ' + error);
        } finally {
            copperConectionWrapper.classList.add('disabled');
            editConnectionBtn.classList.remove('disabled');
        }
    }

    const handleEditConnection = (e) => {
        e.preventDefault();

        if(copperConectionWrapper.classList.contains('disabled')) {
            copperConectionWrapper.classList.remove('disabled');
            editConnectionBtn.classList.add('disabled');
        }
    }

    const fetchPipelines = () => {
        const url = 'https://api.prosperworks.com/developer_api/v1/pipelines';
        const headers = getHeaders();

        fetch(url, {
            method: 'GET',
            headers: headers
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject(resp);
            }
        }).then(data => {
            while (selectPipeline.options.length) selectPipeline.remove(0);
            selectPipeline.add(new Option('-- Please choose a pipeline --', ''));

            for (let i in data) {
                selectPipeline.add(new Option(data[i].name, data[i].id));
            };
        }).catch(error => {
            sendFormBtn.disabled = false;
            console.error('Error:', error);
        });
    }

    const fetchCompanyID = () => {
        const companiesUrl = 'https://api.prosperworks.com/developer_api/v1/companies/search';
        const retrievedAcountDataObject = localStorage.getItem('acoundDetailData');
        const acountDetailData = JSON.parse(retrievedAcountDataObject);

        const headers = getHeaders();

        fetch(companiesUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                "name": acountDetailData['company_name']
            })
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject(resp);
            }
        }).then(data => {
            fetchPrimaryContactID(data[0].id);
        }).catch(error => {
            sendFormBtn.disabled = false;
            console.error('Error:', error);
        });
    }

    const fetchPrimaryContactID = (companyID) => {
        const companiesUrl = 'https://api.prosperworks.com/developer_api/v1/people/search';

        const headers = getHeaders();

        fetch(companiesUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                "company_ids": [companyID],
                "page_size": 200,
                "sort_direction": "asc"
            })
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject(resp);
            }
        }).then(data => {
            primaryContactID = data.map(item => {
                const newItem = {
                    id: item.id,
                    name: item.name,
                    email: item.emails.length ? item.emails[0].email : ""
                }
                return newItem;
            });
        }).catch(error => {
            sendFormBtn.disabled = false;
            console.error('Error:', error);
        });
    }

    const handleClickSendForm = (e) => {
        e.preventDefault();

        let messageElem = getMessageElement('send-form', e.target);

        const hasErrors = isTheFormCorrect(); // function returns first field with an error
        // If there are errrors, don't submit form and focus on first element with error
        if (hasErrors) {
            hasErrors.focus();
            showItemMessage(messageElem, 'Please, complete the form', 'error-message', sendFormBtn, true);
        } else if (selectPipeline.value === '') {
            showItemMessage(messageElem, 'Please, complete the form', 'error-message', sendFormBtn, true);
        } else {
            showItemMessage(messageElem, '', 'success-message', sendFormBtn, true);
            sendFormBtn.textContent = "Sending...";

            const retrievedAcountDataObject = localStorage.getItem('acoundDetailData');
            const acountDetailData = JSON.parse(retrievedAcountDataObject);

            const data = {
                name: postTitleInput.value,
                primary_contact_id: 38536682,
                company_id: acountDetailData['company_id'],
                pipeline_id: Number(selectPipeline.value),
                details: postContentTextarea.value,
            };

            const url = 'https://api.prosperworks.com/developer_api/v1/opportunities';
            const headers = getHeaders();

            fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
            }).then(resp => {
                if (resp.ok) {
                    popup.classList.add('success');
                    clearExtractedData(false);

                    chrome.windows.getCurrent((win) => {
                        const closeWindowBtn = document.getElementById('close-window');
                        const countdownWrapper = document.getElementById('count-down');
                        let countdownInSeconds = 5;

                        const closeWindow = () => {
                            clearInterval(intervalId);
                            chrome.windows.remove(win.id);
                        }

                        const intervalId = setInterval(() => {
                            countdownWrapper.textContent = String(--countdownInSeconds);
                            if (countdownInSeconds === 0) {
                                closeWindow();
                            }
                        }, 1000);

                        closeWindowBtn.addEventListener('click', () => {
                            closeWindow();
                        });
                    });
                } else {
                    return Promise.reject(resp);
                };
            }).catch(error => {
                sendFormBtn.textContent = "Send to Copper"
                showItemMessage(messageElem, 'Error sending to system. Try sending the data again later.', 'error-message', sendFormBtn, false);
                console.error('Error:', error);
            });
        };
    };

    // Listen to all input events
    scratchMeForm.addEventListener('input', handleInputEvent, true);
    // Choose a format
    selectDataFormat.addEventListener('change', handleChangeSelectFormat, false);

    sysTestConnectionBtn.addEventListener('click', handleClickTestConnection, false);

    sysSaveConnectionBtn.addEventListener('click', handleClickSaveConnection, false);

    sendFormBtn.addEventListener('click', handleClickSendForm, false);

    clearDataBtn.addEventListener('click', clearExtractedData, false);
    
    editConnectionBtn.addEventListener('click', handleEditConnection, false);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showFormScratchMe);
} else {
    showFormScratchMe();
}