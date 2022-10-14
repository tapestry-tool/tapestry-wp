refreshUploadInProgress();

setInterval(function () {
  refreshUploadInProgress();
}, 30 * 1000);

function openRequest(method, endpoint) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, WP_VARIABLES.apiUrl + endpoint);
  xhr.setRequestHeader(`X-WP-Nonce`, WP_VARIABLES.wpNonce);

  return xhr;
}

function refreshUploadInProgress() {
  const xhr = openRequest("GET", "/kaltura/upload_status");

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      response = JSON.parse(xhr.responseText);

      inProgressNotice = document.getElementById("upload_in_progress_notice");
      if (response.inProgress) {
        inProgressNotice.style.display = "block";
      } else {
        inProgressNotice.style.display = "none";
      }
    }
  };

  xhr.send();
}

function cleanUploadedVideos() {
  const xhr = openRequest("POST", "/kaltura/videos/converting");
  
  const btn = document.getElementById("refresh_uploaded_videos");
  btn.toggleAttribute("disabled");
  btn.innerText = "Cleaning...";

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      response = JSON.parse(xhr.responseText);
      const videos = response.processedVideos;

      const table = document.getElementById("cleaned_videos_table");
      const old_tbody = table.lastChild;
      const tbody = document.createElement("tbody");

      if (videos.length === 0) {
        const placeholderRow = document.createElement("tr");
        const placeholderCell = document.createElement("td");
        placeholderCell.innerText = "No videos found that need updating.";
        placeholderRow.appendChild(placeholderCell);
        tbody.appendChild(placeholderRow);
      } else {
        for (const video of videos) {
          const row = document.createElement("tr");

          for (const key in video) {
            const cell = document.createElement("td");
            cell.innerText = video[key];
            row.appendChild(cell);
          }

          tbody.appendChild(row);
        }
      }

      table.replaceChild(tbody, old_tbody);
      document.getElementById("cleaned_videos_table").style.display = "table";
    }
    btn.removeAttribute("disabled");
    btn.innerText = "Clean Uploaded Videos";
  };

  const useKalturaPlayer =
    document.getElementById("use_kaltura_player").checked;

  xhr.send(
    JSON.stringify({
      useKalturaPlayer: useKalturaPlayer,
    })
  );
  document.getElementById("cleaned_videos_table").style.display = "none";
}

function forceResetUploadStatus() {
  if (!confirm("Are you sure you want to force reset the upload status?")) {
    return;
  }

  const xhr = openRequest("POST", "/kaltura/upload_status/reset");

  const btn = document.getElementById("reset_upload_status");
  btn.toggleAttribute("disabled");
  btn.innerText = "Resetting...";

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      response = JSON.parse(xhr.responseText);

      const noticeElement = document.getElementById(
        "tapestry_reset_upload_status_notice"
      );
      const classList = noticeElement.classList;

      if (response.success) {
        classList.remove("notice-error");
        classList.add("notice-success");
        noticeElement.firstElementChild.textContent =
          "Successfully reset the upload status.";
      } else {
        classList.remove("notice-success");
        classList.add("notice-error");
        noticeElement.firstElementChild.textContent =
          "The upload status could not be reset. Please try again later.";
      }

      noticeElement.style.display = "block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  btn.removeAttribute("disabled");
  btn.innerText = "Reset Upload Status";

  xhr.send();
}
