import axios from "axios"
import { data } from "./wp"

const { apiUrl, nonce, postId } = data

class KalturaAPI {
  /**
   *
   * @param {Number} postId
   */
  constructor(postId) {
    this.kclient = axios.create({
      baseURL: apiUrl,
      headers: {
        "X-WP-Nonce": nonce,
      },
    })
    this.postId = postId
  }

  /**
   * Upload video to Kaltura
   *
   * @param   {Object}    event
   * @param   {Object}    cancelToken
   * @param   {Function}  onUploadProgress
   *
   * @return  {String}    audio       base64 data string
   */
  async uploadVideo(event, cancelToken, onUploadProgress) {
    const url = `/tapestries/${this.postId}/video`
    const formData = new FormData()
    formData.append("action", "upload-attachment")
    formData.append(
      "async-upload",
      event.dataTransfer && event.dataTransfer.files
        ? event.dataTransfer.files[0]
        : event.target.files[0]
    )
    formData.append(
      "name",
      event.dataTransfer && event.dataTransfer.files
        ? event.dataTransfer.files[0]
        : event.target.files[0].name
    )

    const response = await this.kclient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      cancelToken: cancelToken,
      onUploadProgress: onUploadProgress,
    })

    return response
  }
}

export default new KalturaAPI(postId)
