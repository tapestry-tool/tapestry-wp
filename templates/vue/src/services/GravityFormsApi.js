import axios from "axios"

const API_URL = wpData.gf_rest_url

const makeUrl = path => `${API_URL}${path}?_gf_json_nonce=${wpData.gf_nonce}`

export default {
  /**
   * Get entries for a given `formId`
   * @param {string | number} formId
   */
  getEntries: function(formId) {
    const url = makeUrl(`/forms/${formId}`)
    return axios.get(url).then(response => response.data)
  },
}
