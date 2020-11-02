export default class ErrorHelper {
  /**
   * Get error message from response
   *
   * @param {Object} response
   *
   * @return {String}
   */
  static getErrorMessage(response) {
    let message = response.response.data.message
    if (message.toLowerCase() == "cookie nonce is invalid") {
      message = "Please log in to edit the tapestry"
    }
    return message
  }
}
