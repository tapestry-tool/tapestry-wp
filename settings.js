window.onload = () => {
    refreshKalturaUploadProgress();
    setInterval(refreshKalturaUploadProgress, 15 * 1000);
};

function openGetRequest(endpoint) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl + endpoint);
    xhr.setRequestHeader(`X-WP-Nonce`, wpNonce);
    
    return xhr;
}

function startKalturaUpload() {
    const xhr = openGetRequest('/kaltura/upload_videos');
    xhr.send();
}

function refreshKalturaUploadProgress() {
    refreshKalturaUploadInProgress();
    refreshKalturaUploadStatus();
}

function refreshKalturaUploadInProgress() {
    const xhr = openGetRequest('/kaltura/upload_in_progress');

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            response = JSON.parse(xhr.responseText);

            if (response === false) {
                document.getElementById('start_kaltura_upload').disabled = false;
            }
        }
    };

    xhr.send();
}

function refreshKalturaUploadStatus() {
    const xhr = openGetRequest('/kaltura/upload_status');

    xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
            return;
        }

        response = JSON.parse(xhr.responseText);

        const table = document.getElementById('upload_progress_table');
        const old_tbody = table.lastChild;
        const tbody = document.createElement('tbody');

        if (response.length === 0) {
            const placeholderRow = document.createElement('tr');
            const placeholderCell = document.createElement('td');
            placeholderCell.innerText = "No videos uploaded.";
            placeholderRow.appendChild(placeholderCell);
            tbody.appendChild(placeholderRow);
        } else {
            for (const video of response) {
                const row = document.createElement('tr');
                        
                for (const key in video) {
                    const cell = document.createElement('td');
                    cell.innerText = video[key];
                    row.appendChild(cell);
                }
    
                tbody.appendChild(row);
            }
        }

        table.replaceChild(tbody, old_tbody);
    };

    xhr.send();
}
