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
  async getTapestry(data = {}) {
    var url = `${apiUrl}/tapestries/${this.postId}`
    if (data.filterUserId && data.filterUserId !== undefined) {
      url += "?filter_user_id=" + data.filterUserId
    }
    const response = await axios.get(url)
    return response.data
  }

  async addTapestry(data = {}) {
    const url = `${apiUrl}/tapestries`
    const response = await axios.post(url, data)
    return response.data
  }

  async importTapestry(data) {
    if (!(data["site-url"] == wpData.wpUrl)) {
      const usersRequest = await axios.get(`${apiUrl}/all_roles`)
      const users = usersRequest.data
      let wp_roles = new Set()
      //defaults
      wp_roles.add("public")
      wp_roles.add("authenticated")
      for (let role of Object.keys(users)) {
        wp_roles.add(role)
      }
      wp_roles.delete("administrator")
      for (let node of data.nodes) {
        node["permissions"] = Object.keys(node["permissions"])
          .filter(key => wp_roles.has(key))
          .reduce((obj, key) => {
            return {
              ...obj,
              [key]: node["permissions"][key],
            }
          }, {})

        node["permissionsOrder"] = node["permissionsOrder"].filter(role =>
          wp_roles.has(role)
        )
        node["author"]["original_author_name"] = node["author"]["name"]
        node["author"]["original_author_email"] = node["author"]["email"]
      }
      alert(
        "As the import was from a different site, roles and users have been changed to suit the current site."
      )
    }
    console.dir(data)

    // do this regardless
    const url = `${apiUrl}/tapestries/${this.postId}`
    const response = await axios.put(url, data)
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

  async deleteNode(id) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${id}`
    return await axios.delete(url)
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

  async deleteLink(linkIndex) {
    const url = `${apiUrl}/tapestries/${this.postId}/links`
    return await axios.delete(url, { data: linkIndex })
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

  async updateNodeCoordinates(id, coordinates) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${id}/coordinates`
    return await axios.put(url, coordinates)
  }

  async getUserProgress() {
    const url = `${apiUrl}/users/progress?post_id=${this.postId}`
    const response = await axios.get(url)
    return response.data
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

  async getUserEntry(formId = 0) {
    const url = `${apiUrl}/users/entries`
    const response = await axios.get(url, {
      params: {
        post_id: this.postId,
        form_id: formId,
      },
    })
    return response.data
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
   * @param   {Number}    nodeId
   * @param   {String}    audio       base64 data string
   *
   * @return  {Object}
   */
  async saveAudio(audio, nodeId, questionId) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeId}/audio`
    const response = await axios.post(url, { audio, questionId })
    return response
  }

  /**
   * Get audio from server
   *
   * @param   {Number}    nodeId
   *
   * @return  {String}    audio       base64 data string
   */
  async getAudio(nodeId, questionId) {
    const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeId}/audio/${questionId}`
    const response = await axios.get(url)
    return response.data
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

  async getH5pSettings() {
    const url = `${apiUrl}/users/h5pSettings?post_id=${this.postId}`
    const response = await axios.get(url)
    return response
  }

  async updateH5pSettings(settings) {
    const url = `${apiUrl}/users/h5pSettings/${this.postId}`
    const response = await axios.post(url, settings)
    return response
  }

  async getUserFavourites() {
    const url = `${apiUrl}/users/favourites?post_id=${this.postId}`
    const response = await axios.get(url)
    return response.data
  }

  async updateUserFavourites(favourites) {
    const url = `${apiUrl}/users/favourites?post_id=${this.postId}`
    const response = await axios.post(url, {
      post_id: this.postId,
      favourites: favourites,
    })
    return response
  }

  async getAllContributors() {
    const url = `${apiUrl}/tapestries/${this.postId}/contributors`
    const response = await axios.get(url)
    return response.data
  }
}
