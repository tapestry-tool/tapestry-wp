import axios from "axios"

const API_URL = wpData.gf_rest_url

const makeUrl = path => `${API_URL}${path}?_gf_json_nonce=${wpData.gf_nonce}`

const request = (method, endpoint) => {
  return axios
    .request({ url: makeUrl(endpoint), method })
    .then(response => response.data)
    .then(({ status, response }) =>
      status >= 400 ? Promise.reject(response) : response
    )
}

/**
 * Get entries for a given `formId`
 * @param {string | number} formId
 */
const getEntries = formId => {
  return request("GET", `/forms/${formId}/entries`).then(
    response => response.entries
  )
}

export default {
  getEntries,
}
