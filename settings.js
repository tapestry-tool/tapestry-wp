function openRequest(method, endpoint) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, WP_VARIABLES.apiUrl + endpoint);
    xhr.setRequestHeader(`X-WP-Nonce`, WP_VARIABLES.wpNonce);
    
    return xhr;
}
