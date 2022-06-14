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
    this.pinchPoint = { x: 0, y: 0 }
  }

  register() {
    const elem = document.getElementById(this.targetDOMId)
    // catch wheel zoom event for MacOS trackpad pinch zoom
    elem.addEventListener("wheel", this.wheelHandler.bind(this), { passive: false })
    // catch 2-finger pinch zoom on mobile browsers
    elem.addEventListener("touchstart", this.startHandler.bind(this))
    elem.addEventListener("touchmove", this.moveHandler.bind(this))
    elem.addEventListener("touchcancel", this.endHandler.bind(this))
    elem.addEventListener("touchend", this.endHandler.bind(this))
  }

  unregister() {
    const elem = document.getElementById(this.targetDOMId)
    if (elem) {
      elem.removeEventListener("wheel", this.wheelHandler.bind(this), {
        passive: false,
      })
      elem.removeEventListener("touchstart", this.startHandler.bind(this))
      elem.removeEventListener("touchmove", this.moveHandler.bind(this))
      elem.removeEventListener("touchcancel", this.endHandler.bind(this))
      elem.removeEventListener("touchend", this.endHandler.bind(this))
    }
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

  wheelHandler(e) {
    if (e.ctrlKey) {
      e.preventDefault()
      this.cb(-0.01 * e.deltaY, e.offsetX, e.offsetY)
      this.debouncedCb()
    } else {
      // posX -= e.deltaX * 2
      // posY -= e.deltaY * 2
    }
  }

  startHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length === 2) {
      this.cache = {}
      let pinchPoint = { x: 0, y: 0 }
      const { left, top } = e.target.getBoundingClientRect()
      for (const touch of e.targetTouches) {
        this.cache[touch.identifier] = { x: touch.clientX, y: touch.clientY }
        pinchPoint.x += touch.pageX - left
        pinchPoint.y += touch.pageY - top
      }
      pinchPoint.x /= 2
      pinchPoint.y /= 2
      this.pinchPoint = pinchPoint
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
        this.cb(scaleDelta, this.pinchPoint.x, this.pinchPoint.y)
        this.debouncedCb()
      }
      this.lastDistance = distance
    }
  }

  endHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length !== 2) {
      this.cache = {}
      this.pinchPoint = { x: 0, y: 0 }
    }
    this.lastDistance = null
  }
}
export default PinchZoom
