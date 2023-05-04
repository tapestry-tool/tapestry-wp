import axios from "axios"
import { data } from "./wp"

const { apiUrl, nonce, postId, adminAjaxUrl } = data
var analyticsEnabled

class TapestryApi {
  /**
   *
   * @param {Number} postId
   */
  constructor(postId) {
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        "X-WP-Nonce": nonce,
      },
    })
    this.postId = postId
  }

  /**
   * Get the tapestry
   *
   * @return  {Object}
   */
  async getTapestry(data = {}) {
    var url = `/tapestries/${this.postId}`
    if (data.filterUserId && data.filterUserId !== undefined) {
      url += "?filter_user_id=" + data.filterUserId
    }
    const response = await this.client.get(url)
    return response.data
  }

  async addTapestry(data = {}) {
    const url = `/tapestries`
    const response = await this.client.post(url, data)
    return response.data
  }

  async importTapestry(data) {
    const url = `/tapestries/${this.postId}`
    try {
      const response = await this.client.put(url, data)
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async importTapestryFromZip(zipFile) {
    const url = `/tapestries/${this.postId}/import_zip`

    const formData = new FormData()
    formData.append("file", zipFile)
    const response = await this.client.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  }

  async getTapestryExport(shouldExportComments) {
    let url = `/tapestries/${this.postId}/export`
    if (shouldExportComments) {
      url += "?exportComments=1"
    }
    const response = await this.client.get(url)
    return response.data
  }

  async getTapestryExportAsZip(shouldExportComments) {
    let url = `/tapestries/${this.postId}/export_zip`
    if (shouldExportComments) {
      url += "?exportComments=1"
    }
    const response = await this.client.get(url)
    return response.data
  }

  async getNode(id) {
    const data = await this.getTapestry()
    return data.nodes[id]
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
  async addNode(payload) {
    const url = `/tapestries/${this.postId}/nodes`
    const response = await this.client.post(url, payload)
    return response
  }

  async deleteNode(id) {
    const url = `/tapestries/${this.postId}/nodes/${id}`
    return await this.client.delete(url)
  }

  /**
   * Add link
   *
   * @param   {Object}    link
   *
   * @return  {Object}
   */
  async addLink(link) {
    const url = `/tapestries/${this.postId}/links`
    return await this.client.post(url, link)
  }

  async deleteLink(link) {
    const url = `/tapestries/${this.postId}/links`
    return await this.client.delete(url, { data: link })
  }

  async reverseLink(link) {
    const url = `/tapestries/${this.postId}/links/reverse`
    return await this.client.post(url, link)
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
    const url = `/tapestries/${this.postId}/nodes/${nodeMetaId}`
    const response = await this.client.put(url, node)
    return response
  }

  async updateNodeCoordinates(id, coordinates) {
    const url = `/tapestries/${this.postId}/nodes/${id}/coordinates`
    return await this.client.put(url, coordinates)
  }

  async getNodeHasDraftChildren(id) {
    const url = `/tapestries/${this.postId}/nodes/${id}/nodeHasDraftChildren`
    const response = await this.client.get(url)
    return response.data
  }

  async addComment(id, comment, replyingTo) {
    const url = `/tapestries/${this.postId}/nodes/${id}/comments`
    const response = await this.client.post(url, {
      comment,
      replyingTo,
    })
    return response.data
  }

  async performCommentAction(id, commentId, action) {
    const url = `/tapestries/${this.postId}/nodes/${id}/comments`
    const response = await this.client.put(url, {
      id: commentId,
      action: action,
    })
    return response.data
  }

  async optimizeNodeThumbnails() {
    const url = `${apiUrl}/tapestries/${this.postId}/optimize_thumbnails`
    return await this.client.post(url)
  }

  async getUserProgress() {
    const url = `/users/progress?post_id=${this.postId}`
    const response = await this.client.get(url)
    return response.data
  }

  async updateUserProgress(id, progressValue) {
    const url = `/users/progress`
    const response = await this.client.post(url, {
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
    const url = `/tapestries/${this.postId}/settings`
    const response = await this.client.put(url, settings)
    return response
  }

  async getNotifications() {
    const url = `/tapestries/${this.postId}/notifications`
    const response = await this.client.get(url)
    return response.data
  }

  async updateNotifications(notifications) {
    const url = `/tapestries/${this.postId}/notifications`
    const response = await this.client.put(url, notifications)
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
  async saveAudio(nodeId, questionId, audio) {
    const url = `/users/activity/audio/tapestries/${this.postId}/nodes/${nodeId}`
    const response = await this.client.post(url, { questionId, audio })
    return response.data
  }

  async completeNode(nodeId) {
    const url = `/users/completed?post_id=${this.postId}&node_id=${nodeId}`
    const response = await this.client.post(url)
    return response
  }

  async completeQuestion(nodeId, questionId, answerType, answer) {
    const url = `/users/activity?post_id=${this.postId}&node_id=${nodeId}&question_id=${questionId}`
    const response = await this.client.post(url, { answerType, answer })
    return response
  }

  async getAllUsersAnswers(nodeId) {
    const url = `/users/answers?post_id=${this.postId}&node_id=${nodeId}`
    const response = await this.client.get(url)
    return response
  }

  async getH5pSettings() {
    const url = `/users/h5pSettings?post_id=${this.postId}`
    const response = await this.client.get(url)
    return response
  }

  async updateH5pSettings(settings) {
    const url = `/users/h5pSettings/${this.postId}`
    const response = await this.client.post(url, settings)
    return response
  }

  async getUserFavourites() {
    const url = `/users/favourites?post_id=${this.postId}`
    const response = await this.client.get(url)
    return response.data
  }

  async getTheme() {
    const url = `/users/userSettings/theme`
    const response = await this.client.get(url)
    return response
  }

  async updateUserSettings(userSettings) {
    const url = `/users/userSettings`
    const response = await this.client.put(url, userSettings)
    return response
  }

  async updateUserFavourites(favourites) {
    const url = `/users/favourites?post_id=${this.postId}`
    const response = await this.client.post(url, {
      post_id: this.postId,
      favourites: favourites,
    })
    return response
  }

  async getLastSelectedNode() {
    const url = `/users/lastSelectedNode?post_id=${this.postId}`
    const response = await this.client.get(url)
    return response.data
  }

  async updateUserLastSelectedNode(nodeId, rowId) {
    const url = `/users/lastSelectedNode?post_id=${this.postId}`
    const response = await this.client.post(url, {
      post_id: this.postId,
      nodeId,
      rowId,
    })
    return response
  }

  async getAllContributors() {
    const url = `/tapestries/${this.postId}/contributors`
    const response = await this.client.get(url)
    return response.data
  }

  enableAnalytics(enable) {
    analyticsEnabled = enable
  }

  async recordAnalyticsEvent(actor, action, object, objectID, details = {}) {
    if (!analyticsEnabled) {
      return
    }
    const analyticsAJAXUrl = adminAjaxUrl // e.g. '/wp-admin/admin-ajax.php' (set to empty string to disable analytics)
    const analyticsAJAXAction = "tapestry_tool_log_event" // Analytics

    if (!analyticsAJAXUrl.length || !analyticsAJAXAction.length) {
      return false
    }

    if (objectID) {
      objectID = "" + this.postId + ":" + objectID
    } else {
      objectID = this.postId
    }

    // details["user-ip"] = document.getElementById("user-ip").innerText
    var params = new URLSearchParams()
    params.append("action", analyticsAJAXAction)
    params.append("actor", actor)
    params.append("action2", action)
    params.append("object", object)
    params.append("object_id", objectID)
    params.append("details", JSON.stringify(details))

    // Send the event to an AJAX URL to be saved
    await this.client.post(analyticsAJAXUrl, params)
  }

  async reviewNode(id, comments) {
    return this.client.post(`/tapestries/${this.postId}/nodes/${id}/review`, {
      comments,
    })
  }

  async questionHasAnswer(nodeId, questionId, answerType) {
    const url = `/tapestries/${this.postId}/nodes/${nodeId}/question/hasAnswers?question_id=${questionId}&answer_type=${answerType}`
    const response = await this.client.get(url)
    return response
  }
}

export default new TapestryApi(postId)
