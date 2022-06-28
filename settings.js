function openRequest(method, endpoint) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, WP_VARIABLES.apiUrl + endpoint);
  xhr.setRequestHeader(`X-WP-Nonce`, WP_VARIABLES.wpNonce);

  return xhr;
}

function cleanUploadedVideos() {
  const xhr = openRequest("POST", "/kaltura/videos/converting");

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      response = JSON.parse(xhr.responseText);
      const videos = response.videos;

      console.log(response);

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
      document.getElementById('cleaned_videos_table').style.display = 'table';
    }
  };

  const useKalturaPlayer = document.getElementById('use_kaltura_player').checked;

  xhr.send(JSON.stringify({
    'useKalturaPlayer': useKalturaPlayer,
  }));
}
