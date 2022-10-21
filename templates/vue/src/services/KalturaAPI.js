import axios from "axios"
import { data } from "./wp"

const { apiUrl, nonce, postId } = data

class KalturaApi {
  /**
   *
   * @param {Number} postId
   */
  constructor(postId) {
    this.client = axios.create({
      baseURL: apiUrl + "/kaltura",
      headers: {
        "X-WP-Nonce": nonce,
      },
    })
    this.postId = postId
  }

  async uploadVideo(videoFile, nodeId) {
    const url =
      `/video?tapestryPostId=${this.postId}` +
      (nodeId ? `&nodeMetaId=${nodeId}` : "")

    const formData = new FormData()
    formData.append("file", videoFile)
    const response = await this.client.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }

  async getVideoStatus(entryId) {
    const url = `/video/status?entry_id=${entryId}`
    const response = await this.client.get(url)
    return response.data
  }

  async getVideoMeta(entryId) {
    const url = `/video/meta?entry_id=${entryId}`
    const response = await this.client.get(url)
    return response.data
  }

  async uploadVideos(nodeIds, useKalturaPlayer) {
    const url = `/videos`
    const response = await this.client.post(url, {
      tapestryID: this.postId,
      nodeIDs: nodeIds,
      useKalturaPlayer: useKalturaPlayer,
    })
    return response
  }

  async getUploadStatus() {
    const url = `/videos/status`
    const response = await this.client.get(url)
    return response.data
  }

  async clearUploadError() {
    const url = `/videos/status/error`
    await this.client.delete(url)
  }

  async stopUpload() {
    const url = `/videos/stop`
    await this.client.post(url)
  }

  async getUploadLog(page, perPage) {
    const url = `/videos/log?tapestryPostId=${this.postId}&page=${page}&count=${perPage}`
    const response = await this.client.get(url)
    return response.data
  }

  async getVideosToUpload() {
    const url = `/videos_to_upload?tapestryPostId=${this.postId}`
    const response = await this.client.get(url)
    return response.data
  }
}

export default new KalturaApi(postId)
