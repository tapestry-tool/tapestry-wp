import axios from "axios"

export default class {
  /**
   *
   * @param {Number} postId
   */
  constructor(postId) {
    axios.defaults.headers.common["X-WP-Nonce"] = wpData.nonce
    this.postId = postId
  }

  /**
   * Get the tapestry
   *
   * @return  {Object}
   */
  async getTapestry() {
    const url = `${apiUrl}/tapestries/${this.postId}`
    const response = await axios.get(url)
    return response.data
  }

  /**
   * Add node
   *
   * @param   {Object}    node
   *
   * @return  {Object}
   */
  async addNode(node) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes`
    const response = await axios.post(url, node)
    return response
  }

  /**
   * Add link
   *
   * @param   {Object}    link
   *
   * @return  {Object}
   */
  async addLink(link) {
    const url = `${apiUrl}/tapestries/${this.postId}/links`
    const response = await axios.post(url, link)
    return response
  }

  /**
   * Add permissions
   *
   * @param   {Number}    nodeMetaId
   * @param   {Object}    permissions
   *
   * @return  {Object}
   */
  async updatePermissions(nodeMetaId, permissions) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/permissions`
    const response = await axios.put(url, permissions)
    return response
  }

  /**
   * Update node
   *
   * @param   {Number}    nodeMetaId
   * @param   {Object}    node
   *
   * @return  {Object}
   */
  async updateNode(nodeMetaId, node) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}`
    const response = await axios.put(url, node)
    return response
  }

  async getSettings() {
    const tapestry = await this.getTapestry()
    return tapestry.settings
  }

  async updateSettings(settings) {
    const url = `${apiUrl}/tapestries/${this.postId}/settings`
    const response = await axios.put(url, settings)
    return response
  }

  /**
   * Upload audio to server
   * 
   * @param   {Number}    nodeMetaId
   * @param   {String}    audio       base64 data string
   * 
   * @return  {Object}
   */
  async uploadAudioToServer(nodeMetaId, audio) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/audio`;
      const response = await axios.post(url, audio);
      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get audio from server
   * 
   * @param   {Number}    nodeMetaId
   * 
   * @return  {String}    audio       base64 data string
   */
  async getH5PAudioFromServer(nodeMetaId) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/audio`;
      const response = await axios.get(url);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
