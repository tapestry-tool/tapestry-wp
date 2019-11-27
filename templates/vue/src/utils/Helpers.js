/**
 * Helper Functions
 */
export default class {
  /**
   * Check if a string only contains digits
   *
   * @param {String} string
   *
   * @return {Boolean}
   */
  static onlyContainsDigits(string) {
    const regex = new RegExp(/^\d+$/)
    return regex.test(string)
  }

  /**
   * Get browser width
   *
   * @return {Number}
   */
  static getBrowserWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  }

  /**
   * Get browser height
   *
   * @return {Number}
   */
  static getBrowserHeight() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  }

  /**
   * Finds the node index with node ID
   *
   * @param  {Number} id          nodeMetaId
   * @param  {Object} tapestry    tapestry
   *
   * @return {Number}
   */
  static findNodeIndex(id, tapestry) {
    function helper(obj) {
      return obj.id == id
    }

    return tapestry.nodes.findIndex(helper)
  }

  static getAspectRatio() {
    const browserHeight = this.getBrowserHeight()
    const browserWidth = this.getBrowserWidth()
    if (browserHeight < 10) {
      return 0
    }
    return browserWidth / browserHeight
  }

  static normalizeUrl(url) {
    return url.startsWith("http:") || url.startsWith("https:") ? url : `https:${url}`
  }

  static createUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  static getImagePath(image) {
    return `${wpData.vue_uri}/${image.split("dist")[1]}`
  }

  static base64ToBlob(b64Data, contentType) {
    const url = `data:${contentType};base64,${b64Data}`
    return new Promise((resolve, reject) => {
      return fetch(url).then(response => {
        resolve(response.blob())
      })
    })
  }
}
