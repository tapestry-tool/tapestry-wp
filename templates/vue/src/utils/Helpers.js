/**
 * Helper Functions
 */
export default class Helpers {
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

  // src: https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it?lq=1
  static decodeHTMLChars(str) {
    return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
  }

  static getYoutubeID(url) {
    const linkRegex = /(?:youtube\.com\/\S*(?:(?:e(?:mbed))?\/|watch\?(?:\S*?&?v=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
    const matchArray = url.match(linkRegex)
    return matchArray === null ? null : matchArray[1] // Returns '' if link is not youtube URL
  }

  /**
   * Shallowly checks if two objects are different from one another
   * @param {Object} src
   * @param {Object} other
   */
  static isDifferent(src, other) {
    const srcKeys = Object.keys(src)
    const otherKeys = Object.keys(other)

    // Check 1: If one object has more keys than the other
    if (srcKeys.length !== otherKeys.length) {
      return true
    }

    // Check 2: If they have the same keys
    if (!srcKeys.every(key => otherKeys.includes(key))) {
      return true
    }

    // Check 3: If the key values are equal
    for (const key of Object.keys(src)) {
      if (src[key] !== other[key]) {
        return true
      }
    }
    return false
  }

  /**
   * Returns a deep copy of a given object.
   * Source: https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
   * @param {Object | Array} obj
   */
  static deepCopy(obj) {
    let outObject, value, key

    if (typeof obj !== "object" || obj === null) {
      return obj // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    outObject = Array.isArray(obj) ? [] : {}

    for (key in obj) {
      value = obj[key]

      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = Helpers.deepCopy(value)
    }

    return outObject
  }

  static hasPermission(node, action) {
    // Check 1: Has edit permissions for Tapestry
    if (wpData.wpCanEditTapestry === "1") {
      return true
    }

    // Check 2: User is the author of the node
    if (wpData.currentUser.ID == node.author.id) {
      return true
    }

    // Check 3: User has a role with general edit permissions
    const { ID, roles } = wpData.currentUser
    const allowedRoles = ["administrator", "editor", "author"]
    if (allowedRoles.some(role => roles.includes(role))) {
      return true
    }

    const { public: publicPermissions, authenticated } = node.permissions
    // Check 4: Node has public permissions
    if (publicPermissions.includes(action)) {
      return true
    }

    // Check 5: Node has authenticated permissions
    if (wpData.currentUser.ID && authenticated.includes(action)) {
      return true
    }

    // Check 6: User has a role that is allowed in the node
    const isRoleAllowed = roles.some(role => {
      const permissions = node.permissions[role]
      if (permissions) {
        return permissions.includes(action)
      }
      return false
    })
    if (isRoleAllowed) {
      return true
    }

    // Check 7: User has a permission associated with its ID
    const userPermissions = node.permissions[`user-${ID}`]
    if (userPermissions) {
      return userPermissions.includes(action)
    }

    return false
  }
}
