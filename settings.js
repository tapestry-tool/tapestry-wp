window.onload = () => {
    refreshKalturaUploadProgress();
    setInterval(refreshKalturaUploadProgress, 15 * 1000);
};

function openGetRequest(endpoint) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', WP_VARIABLES.apiUrl + endpoint);
    xhr.setRequestHeader(`X-WP-Nonce`, WP_VARIABLES.wpNonce);
    
    return xhr;
}

function startKalturaUpload() {
    const xhr = openGetRequest('/kaltura/upload_videos');
    xhr.send();
}

function refreshKalturaUploadProgress() {
    const xhr = openGetRequest('/kaltura/upload_status');

    xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
            return;
        }

        response = JSON.parse(xhr.responseText);

        if (response.inProgress === false) {
            document.getElementById('start_kaltura_upload').disabled = false;
        }

        const table = document.getElementById('upload_progress_table');
        const old_tbody = table.lastChild;
        const tbody = document.createElement('tbody');

        if (response.videos.length === 0) {
            const placeholderRow = document.createElement('tr');
            const placeholderCell = document.createElement('td');
            placeholderCell.innerText = "No videos to upload.";
            placeholderRow.appendChild(placeholderCell);
            tbody.appendChild(placeholderRow);
        } else {
            for (const video of response.videos) {
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
