    export default class ErrorHelper {
    /**
   * Return true if response is an error
   *
   * @param {Object} response
   *
   * @return {Boolean}
   */
    static isError(response) {
        return response.status !== 200
    }

    /**
   * Get error message from response
   *
   * @param {Object} response
   *
   * @return {String}
   */
    static getErrorMessage(response) {
        return response.response.data.message
    }
}