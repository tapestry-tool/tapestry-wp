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
    return Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
  }

  /**
   * Get browser height
   *
   * @return {Number}
   */
  static getBrowserHeight() {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    )
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
}
