import Helpers from "./Helpers"
class PinchZoom {
  cb
  debouncedCb
  cache
  lastDistance

  constructor(targetDOMId, callback, debouncedCallback) {
    this.cb = callback
    this.debouncedCb = Helpers.debounce(debouncedCallback)
    this.targetDOMId = targetDOMId
    this.cache = {}
    this.lastDistance = null
  }

  register() {
    const elem = document.getElementById(this.targetDOMId)
    elem.addEventListener("touchstart", this.startHandler.bind(this))
    elem.addEventListener("touchmove", this.moveHandler.bind(this))
    elem.addEventListener("touchcancel", this.endHandler.bind(this))
    elem.addEventListener("touchend", this.endHandler.bind(this))
  }

  unregister() {
    const elem = document.getElementById(this.targetDOMId)
    elem.removeEventListener("touchstart", this.startHandler.bind(this))
    elem.removeEventListener("touchmove", this.moveHandler.bind(this))
    elem.removeEventListener("touchcancel", this.endHandler.bind(this))
    elem.removeEventListener("touchend", this.endHandler.bind(this))
  }

  _calcDistance() {
    const keys = Object.keys(this.cache)
    if (keys.length === 2) {
      const a = this.cache[keys[0]]
      const b = this.cache[keys[1]]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    return null
  }

  startHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length === 2) {
      this.cache = {}
      for (const touch of e.targetTouches) {
        this.cache[touch.identifier] = { x: touch.clientX, y: touch.clientY }
      }
      this.lastDistance = this._calcDistance()
    }
  }

  moveHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length === 2) {
      for (const touch of e.targetTouches) {
        if (!this.cache[touch.identifier]) {
          return
        }
        this.cache[touch.identifier] = { x: touch.clientX, y: touch.clientY }
      }
      const distance = this._calcDistance()
      if (distance !== null && this.lastDistance !== null) {
        const delta = distance - this.lastDistance
        const scaleDelta = delta * 0.01
        this.cb(scaleDelta)
        this.debouncedCb()
      }
      this.lastDistance = distance
    }
  }

  endHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length !== 2) {
      this.cache = {}
    }
    this.lastDistance = null
  }
}
export default PinchZoom
