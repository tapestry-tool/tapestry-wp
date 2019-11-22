import axios from "axios"
import Helpers from "../utils/Helpers"

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

  async getNode(id) {
    const data = await this.getTapestry()
    return data.nodes[Helpers.findNodeIndex(id, data)]
  }

  async getNodeProgress(id) {
    const progress = await this.getUserProgress()
    return progress[id]
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

  async getUserProgress() {
    const url = `${apiUrl}/users/progress?post_id=${this.postId}`
    const response = await axios.get(url)
    return JSON.parse(response.data)
  }

  async updateUserProgress(id, progressValue) {
    const url = `${apiUrl}/users/progress`
    const response = await axios.post(url, {
      post_id: this.postId,
      node_id: id,
      progress_value: progressValue,
    })
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
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/audio/${audio.h5pId}`;
      const response = await axios.post(url, audio.blob);
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
  async getH5PAudioFromServer(nodeMetaId, h5pId) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/audio/${h5pId}`;
      const response = await axios.get(url);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get H5P audio nodes that are recorded
   * 
   * @return  {Array}    nodeIds       an array of node IDs
   */
  async getRecordedNodeIds() {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/recorded-audio-nodes`;
      const response = await axios.get(url);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async completeNode(nodeId) {
    const url = `${apiUrl}/users/completed?post_id=${this.postId}&node_id=${nodeId}`
    const response = await axios.post(url)
    return response
  }

  async completeQuestion(nodeId, questionId) {
    const url = `${apiUrl}/users/quiz?post_id=${this.postId}&node_id=${nodeId}&question_id=${questionId}`
    const response = await axios.post(url)
    return response
  }

  async getGravityForm(formId) {
    const url = `${adminAjaxUrl}?action=gf_button_get_form&form_id=${formId}`
    const response = await axios.get(url)
    return response
  }

  async getH5pSettings() {
    const url = `${apiUrl}/users/h5pSettings?post_id=${this.postId}`
    const response = await axios.get(url)
    return response
  }

  async updateH5pSettings(settings) {
    const url = `${apiUrl}/users/h5pSettings`
    const response = await axios.post(url, {
      post_id: this.postId,
      json: settings,
    })
    return response
  }
}
