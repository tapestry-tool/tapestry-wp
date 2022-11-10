import * as wp from "@/services/wp"
import TinyColor from "tinycolor2"
import { nodeStatus, userActions } from "./constants"
import store from "../store"

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
   * [DO NOT USE DIRECTLY! Use the browserDimensions Vuex state instead]
   * Get browser width
   *
   * @return {Number}
   */
  static getBrowserWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  }

  /**
   * [DO NOT USE DIRECTLY! Use the browserDimensions Vuex state instead]
   * Get browser height, taking the admin bar into account if the bar is visible
   *
   * @return {Number}
   */
  static getBrowserHeight() {
    const adminBar = document.getElementById("wpadminbar")
    return (
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0) -
      (adminBar && adminBar.clientHeight ? adminBar.clientHeight : 0)
    )
  }

  /**
   * Convert the number in css rem units to number in px
   * @param {Number} rem
   * @return {Number}
   */
  static remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  /**
   * Check if user is on a touch enabled device
   *
   * @returns {Boolean}
   */
  static isTouchEnabledDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
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
    return `${wp.data.vue_uri}/${image.split("dist")[1]}`
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
   * Checks if two operands are different from one another
   * Note: We evaluate Null, "", {}, [], false, 0, and Undefined all as being the same
   * @param src
   * @param other
   */
  static isDifferent(src, other) {
    // This means we evaluate Null, "", {}, [], false, 0, and Undefined all as being the same
    if (!src && !other) {
      return false
    }

    // General type check
    if (typeof src !== typeof other || Array.isArray(src) !== Array.isArray(other)) {
      return true
    }

    // Arrays
    if (Array.isArray(src)) {
      if (
        src.length !== other.length &&
        src.some(key => !other.includes(key)) &&
        src.some(key => this.isDifferent(src[key], other[key]))
      ) {
        return true
      }
      return false
    }

    // Objects
    if (typeof src === "object") {
      const srcKeys = Object.keys(src)
      const otherKeys = Object.keys(other)
      if (
        srcKeys.length !== otherKeys.length ||
        srcKeys.some(key => !otherKeys.includes(key)) ||
        srcKeys.some(key => this.isDifferent(src[key], other[key]))
      ) {
        return true
      }
      return false
    }

    // Other
    if (src !== other) {
      return true
    }

    return false
  }

  /**
   * Checks if two nodes are equal to each other
   * - Allows missing property as long as loosely equals null
   * Reference: https://stackoverflow.com/questions/25456013/javascript-deepequal-comparison/25456134
   * @param {Object} src
   * @param {Object} other
   * @param {Array} ignoreProps
   */
  static nodeEqual(src, other, ignoreProps = []) {
    if (src === other) {
      return true
    } else if (Array.isArray(src) && Array.isArray(other)) {
      if (src.length !== other.length) return false

      for (let i = 0; i < src.length; i++) {
        if (!Helpers.nodeEqual(src[i], other[i])) return false
      }
    } else if (
      typeof src == "object" &&
      src != null &&
      typeof other == "object" &&
      other != null
    ) {
      for (let prop in src) {
        if (ignoreProps.includes(prop)) continue
        if (other.hasOwnProperty(prop)) {
          if (!Helpers.nodeEqual(src[prop], other[prop])) {
            return false
          }
        } else {
          // If property does not exist, check if null or false
          if (src[prop] != 0) {
            return false
          }
        }
      }
    } else {
      return false
    }
    return true
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

  static hasPermission(node, action, showRejected) {
    // Check 0: node is null case - this should only apply to creating the root node.
    if (node === null) {
      return wp.canEditTapestry()
    }

    // Public users never have any permissions other than read
    if (action !== userActions.READ && !wp.isLoggedIn()) {
      return false
    }

    // Checks related to draft nodes
    /**
     * If node is a draft:
     *  - Allow author to move submitted and rejected nodes
     *  - Allow all actions for original author EXCEPT if the node is submitted for
     *    review
     *  - Allow "read" to reviewers only if the node is submitted for review
     */
    if (node.status === nodeStatus.DRAFT) {
      if (node.author && wp.isCurrentUser(node.author.id) && action == "move") {
        if (node.reviewStatus !== nodeStatus.ACCEPT) {
          return true
        }
      }
      if (node.author && wp.isCurrentUser(node.author.id)) {
        return action === userActions.READ || node.reviewStatus !== nodeStatus.SUBMIT
      }
      if (wp.canEditTapestry()) {
        if (action === userActions.READ) {
          return (
            node.reviewStatus === nodeStatus.SUBMIT ||
            (showRejected && node.reviewStatus === nodeStatus.REJECT)
          )
        }
        return false
      }
      return false
    }

    // Check 1: User has edit permissions for Tapestry
    if (wp.canEditTapestry()) {
      return true
    }

    // Check 2: User is the author of the node (unless node was submitted, then accepted)
    if (node.author && wp.isCurrentUser(node.author.id)) {
      if (node.reviewStatus !== nodeStatus.ACCEPT) {
        return true
      }
    }

    // Check 3: User has a role with general edit permissions
    const { id, roles } = wp.getCurrentUser()
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
    if (wp.isLoggedIn() && authenticated && authenticated.includes(action)) {
      return true
    }

    // Check 6: User has a role that is allowed in the node
    const isRoleAllowed = roles.some(role => {
      const permissions = node.permissions[role]
      return permissions && permissions.includes(action)
    })
    if (isRoleAllowed) {
      return true
    }

    // Check 7: User has a permission associated with its ID
    const userPermissions = node.permissions[`user-${id}`]
    if (userPermissions) {
      return userPermissions.includes(action)
    }

    return false
  }

  static hasKalturaUploadPermission() {
    const { roles } = wp.getCurrentUser()
    const allowedRole = "administrator"

    return roles.includes(allowedRole)
  }

  /**
   * Given an array of objects, return an array of unique objects
   * determined by the given label.
   * @template T
   * @param {T[]} objs
   * @param {string} label
   * @return {T[]}
   */
  static unique(objs, label) {
    const uniques = new Map()
    for (const obj of objs) {
      if (!uniques.has(obj[label])) {
        uniques.set(obj[label], obj)
      }
    }
    return [...uniques.values()]
  }

  /**
   * @template T
   * @param {T} obj
   * @param {(keyof T)[]} keys
   */
  static omit(obj, keys) {
    const partial = {}
    for (const key in obj) {
      if (!keys.includes(key)) {
        partial[key] = obj[key]
      }
    }
    return partial
  }

  static deepMerge(source, other) {
    const out = { ...source }
    for (const key in other) {
      const value = other[key]
      if (value && typeof value === "object" && !Array.isArray(value)) {
        out[key] = Helpers.deepMerge(out[key], value)
      } else {
        out[key] = value
      }
    }
    return out
  }

  static createDefaultNode({ settings = {}, ...overrides } = {}) {
    const baseNode = {
      type: "tapestry_node",
      description: "",
      conditions: [],
      behaviour: "new-window",
      status: "publish",
      nodeType: "child",
      title: "",
      imageURL: "",
      lockedImageURL: "",
      mediaType: "text",
      mediaFormat: "",
      presentationStyle: "",
      mediaDuration: 0,
      typeId: 1,
      group: 1,
      progress: 0,
      permissions: settings.defaultPermissions || {
        public: ["read"],
        authenticated: ["read"],
      },
      typeData: {
        linkMetadata: null,
        mediaURL: "",
        mediaWidth: 960, //TODO: This needs to be flexible with H5P
        mediaHeight: 600,
      },
      hideTitle: false,
      hideProgress: false,
      hideMedia: false,
      hideWhenLocked: false,
      backgroundColor: "#8396a1",
      textColor: "white",
      skippable: true,
      fullscreen: false,
      coordinates: {
        x: 3000,
        y: 3000,
      },
      childOrdering: [],
      references: "",
      unlocked: true,
      accessible: true,
      reviewComments: [],
      popup: null,
      level: 1,
    }
    return Helpers.deepMerge(baseNode, overrides)
  }

  /**
   * Return the X, Y position of an element within another given element
   * @param {DOM Element} element
   * @param {DOM Element} container
   * @returns {Object} {x, y}
   */
  static getPositionOfElementInElement(element, container) {
    var xPosition = 0
    var yPosition = 0

    while (element && !element.isSameNode(container)) {
      xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft
      yPosition += element.offsetTop - element.scrollTop + element.clientTop
      element = element.offsetParent
    }

    return { x: xPosition, y: yPosition }
  }

  static debounce(func, wait = 300) {
    let timeout
    return function(...args) {
      const context = this
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(context, args), wait)
    }
  }

  /**
   * Map value from [1, maxLevel] to [from, to]
   * @param {Number} level the current level, in [1, maxLevel]
   * @param {Number} maxLevel the maximum level
   * @param {Number} from the minimum value
   * @param {Number} to the maximum value
   * @return {number}
   */
  static mapLevel(level, maxLevel, from, to) {
    if (maxLevel === 1) {
      return from
    }
    return from + (to - from) * ((level - 1) / (maxLevel - 1))
  }

  static darkenColor(color, level, maxLevel) {
    let hsl = TinyColor(color).toHsl()
    const amount = Helpers.mapLevel(
      level,
      maxLevel,
      1,
      Math.max(1 - maxLevel * 0.05, 0.7)
    )
    hsl.s = hsl.s * amount
    hsl.l = hsl.l * amount
    return TinyColor(hsl).toHexString()
  }

  static getDropShadow(level, maxLevel, scale = 1) {
    return {
      offset: 4 * (maxLevel - level) * scale + 3,
      blur: Helpers.mapLevel(level, maxLevel, 16, 5),
      opacity: Helpers.mapLevel(level, maxLevel, 0.2, 0.5),
    }
  }

  static getNodeVisibility(level, scale, depth) {
    const levelDiff = level - Helpers.getCurrentLevel(scale)
    if (levelDiff < depth) {
      return 1 // fully visible
    } else if (levelDiff === depth) {
      return 0 // grandchild visible
    }
    return -1 // not visible
  }

  static getTargetScale(level) {
    return Math.max(1, level / store.state.scaleConstants.levelMultiplier)
  }

  static getCurrentLevel(scale) {
    return Math.floor(scale * store.state.scaleConstants.levelMultiplier)
  }

  static getNodeBaseRadius(level) {
    return 140 * Math.pow(0.75, level - 1)
  }

  static getNodeRadius(level, scale) {
    const baseRadius = Helpers.getNodeBaseRadius(level)
    const currentLevel = Helpers.getCurrentLevel(scale)
    if (level < currentLevel) {
      // growth rate should be slow for nodes higher than current level
      const baseScale = (level + 1) / store.state.scaleConstants.levelMultiplier
      return (
        baseRadius *
        (baseScale +
          (scale - baseScale) / store.state.scaleConstants.largeNodeGrowthSupressor)
      )
    } else {
      return baseRadius * scale
    }
  }

  static getMinimapLinePoints(source, target) {
    const x1 = source.coordinates.x,
      y1 = source.coordinates.y,
      x2 = target.coordinates.x,
      y2 = target.coordinates.y
    let width1 =
        Helpers.getNodeBaseRadius(source.level) *
        store.state.scaleConstants.lineWidthRatio,
      width2 =
        Helpers.getNodeBaseRadius(target.level) *
        store.state.scaleConstants.lineWidthRatio
    // make width differences more dramatic for better visual aid
    if (source.level < target.level) {
      width1 *= store.state.scaleConstants.widthDifferenceEnhancer.grow
      width2 *= store.state.scaleConstants.widthDifferenceEnhancer.shrink
    } else if (source.level > target.level) {
      width2 *= store.state.scaleConstants.widthDifferenceEnhancer.grow
      width1 *= store.state.scaleConstants.widthDifferenceEnhancer.shrink
    }
    const angle = Math.atan((y2 - y1) / (x2 - x1))
    const dx1 = -1 * width1 * Math.sin(angle),
      dy1 = width1 * Math.cos(angle),
      dx2 = -1 * width2 * Math.sin(angle),
      dy2 = width2 * Math.cos(angle)
    return [
      { x: x1 + dx1, y: y1 + dy1 },
      { x: x1 - dx1, y: y1 - dy1 },
      { x: x2 - dx2, y: y2 - dy2 },
      { x: x2 + dx2, y: y2 + dy2 },
    ]
  }

  static getLinePolygonPoints(source, target, scale = 1) {
    const x1 = source.coordinates.x * scale,
      y1 = source.coordinates.y * scale,
      x2 = target.coordinates.x * scale,
      y2 = target.coordinates.y * scale
    let width1 =
        Helpers.getNodeRadius(source.level, scale) *
        store.state.scaleConstants.lineWidthRatio,
      width2 =
        Helpers.getNodeRadius(target.level, scale) *
        store.state.scaleConstants.lineWidthRatio
    // make width differences more dramatic for better visual aid
    if (source.level < target.level) {
      width1 *= store.state.scaleConstants.widthDifferenceEnhancer.grow
      width2 *= store.state.scaleConstants.widthDifferenceEnhancer.shrink
    } else if (source.level > target.level) {
      width2 *= store.state.scaleConstants.widthDifferenceEnhancer.grow
      width1 *= store.state.scaleConstants.widthDifferenceEnhancer.shrink
    }
    const angle = Math.atan((y2 - y1) / (x2 - x1))
    const dx1 = -1 * width1 * Math.sin(angle),
      dy1 = width1 * Math.cos(angle),
      dx2 = -1 * width2 * Math.sin(angle),
      dy2 = width2 * Math.cos(angle)
    return `${x1 + dx1},${y1 + dy1} ${x1 - dx1},${y1 - dy1} ${x2 - dx2},${y2 -
      dy2} ${x2 + dx2},${y2 + dy2}`
  }
}
