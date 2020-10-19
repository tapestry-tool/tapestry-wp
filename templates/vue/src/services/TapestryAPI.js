import axios from "axios"
import Helpers from "../utils/Helpers"

class TapestryApi {
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
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return error
    }
  }

  async addTapestry(data = {}) {
    const url = `${apiUrl}/tapestries`
    try {
      const response = await axios.post(url, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  async getAllRoles() {
    try {
      const usersRequest = await axios.get(`${apiUrl}/roles`)
      const users = usersRequest.data
      let wp_roles = new Set()
      //defaults
      wp_roles.add("public")
      wp_roles.add("authenticated")
      for (let role of Object.keys(users)) {
        wp_roles.add(role)
      }
      wp_roles.delete("administrator")
      return wp_roles
    } catch (error) {
      return error
    }
  }

  async importTapestry(data) {
    const url = `${apiUrl}/tapestries/${this.postId}`
    try {
      const response = await axios.put(url, data)
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async getNode(id) {
    try {
      const data = await this.getTapestry()
      return data.nodes[Helpers.findNodeIndex(id, data)]
    } catch (error) {
      return error
    }
  }

  async getNodeProgress(id) {
    try {
      const progress = await this.getUserProgress()
      return progress[id]
    } catch (error) {
      return error
    }
  }

  /**
   * Add node
   *
   * @param   {Object}    node
   *
   * @return  {Object}
   */
  async addNode(node) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes`
      const response = await axios.post(url, node)
      return response
    } catch (error) {
      return error
    }
  }

  async deleteNode(id) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${id}`
      return await axios.delete(url)
    } catch (error) {
      return error
    }
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
    try {
      var response = await axios.post(url, link)
      return response
    } catch (error) {
      return error
    }
  }

  async deleteLink(link) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/links`
      return await axios.delete(url, { data: link })
    } catch (error) {
      return error
    }
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
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/permissions`
      const response = await axios.put(url, permissions)
      return response
    } catch (error) {
      return error
    }
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
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}`
      const response = await axios.put(url, node)
      return response
    } catch (error) {
      return error
    }
  }

  async updateNodeCoordinates(id, coordinates) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${id}/coordinates`
      return await axios.put(url, coordinates)
    } catch (error) {
      return error
    }
  }

  async getUserProgress() {
    try {
      const url = `${apiUrl}/users/progress?post_id=${this.postId}`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return error
    }
  }

  async updateUserProgress(id, progressValue) {
    try {
      const url = `${apiUrl}/users/progress`
      const response = await axios.post(url, {
        post_id: this.postId,
        node_id: id,
        progress_value: progressValue,
      })
      return response
    } catch (error) {
      return error
    }
  }

  async getUserEntry(formId = 0) {
    try {
      const url = `${apiUrl}/users/entries`
      const response = await axios.get(url, {
        params: {
          post_id: this.postId,
          form_id: formId,
        },
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  async getSettings() {
    try {
      const tapestry = await this.getTapestry()
      return tapestry.settings
    } catch (error) {
      return error
    }
  }

  async updateSettings(settings) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/settings`
      const response = await axios.put(url, settings)
      return response
    } catch (error) {
      return error
    }
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
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeId}/audio`
      const response = await axios.post(url, { audio, questionId })
      return response
    } catch (error) {
      return error
    }
  }

  /**
   * Get audio from server
   *
   * @param   {Number}    nodeId
   *
   * @return  {String}    audio       base64 data string
   */
  async getAudio(nodeId, questionId) {
    try {
      const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeId}/audio/${questionId}`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return error
    }
  }

  async completeNode(nodeId) {
    try {
      const url = `${apiUrl}/users/completed?post_id=${this.postId}&node_id=${nodeId}`
      const response = await axios.post(url)
      return response
    } catch (error) {
      return error
    }
  }

  async completeQuestion(nodeId, questionId) {
    try {
      const url = `${apiUrl}/users/quiz?post_id=${this.postId}&node_id=${nodeId}&question_id=${questionId}`
      const response = await axios.post(url)
      return response
    } catch (error) {
      return error
    }
  }

  async getH5pSettings() {
    try {
      const url = `${apiUrl}/users/h5pSettings?post_id=${this.postId}`
      const response = await axios.get(url)
      return response
    } catch (error) {
      return error
    }
  }

  async updateH5pSettings(settings) {
    try {
      const url = `${apiUrl}/users/h5pSettings/${this.postId}`
      const response = await axios.post(url, settings)
      return response
    } catch (error) {
      return error
    }
  }

  async getUserFavourites() {
    try {
      const url = `${apiUrl}/users/favourites?post_id=${this.postId}`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return error
    }
  }

  async updateUserFavourites(favourites) {
    try {
      const url = `${apiUrl}/users/favourites?post_id=${this.postId}`
      const response = await axios.post(url, {
        post_id: this.postId,
        favourites: favourites,
      })
      return response
    } catch (error) {
      return error
    }
  }

  async getAllContributors() {
    const url = `${apiUrl}/tapestries/${this.postId}/contributors`
    const response = await axios.get(url)
    return response.data
  }

  async recordAnalyticsEvent(actor, action, object, objectID, details = {}) {
    const analyticsAJAXUrl = "" // e.g. '/wp-admin/admin-ajax.php' (set to empty string to disable analytics)
    const analyticsAJAXAction = "tapestry_tool_log_event" // Analytics

    if (!analyticsAJAXUrl.length || !analyticsAJAXAction.length) {
      return false
    }

    // TODO: Also need to save the tapestry slug or ID in the events

    details["user-ip"] = document.getElementById("user-ip").innerText

    const data = {
      action: analyticsAJAXAction,
      actor: actor,
      action2: action,
      object: object,
      user_guid: Helpers.createUUID(),
      object_id: objectID,
      details: JSON.stringify(details),
    }

    // Send the event to an AJAX URL to be saved
    await axios.post(analyticsAJAXUrl, data)
  }
}

export default new TapestryApi(wpPostId)
