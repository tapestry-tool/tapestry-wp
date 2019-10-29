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

  async completeNode(nodeId) {
    const url = `${apiUrl}/users/completed?post_id=${this.postId}&node_id=${nodeId}`
    const response = await axios.post(url)
    return response
  }

  async getH5pSettings() {
    const url = `${apiUrl}/users/h5pSettings?post_id=${this.postId}`
    const response = await axios.get(url)
    return response
  }
}
