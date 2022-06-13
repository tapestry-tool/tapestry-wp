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
    elem.addEventListener("pointerdown", this.downHandler.bind(this))
    elem.addEventListener("pointermove", this.moveHandler.bind(this))
    elem.addEventListener("pointerup", this.upHandler.bind(this))
    elem.addEventListener("pointercancel", this.upHandler.bind(this))
    elem.addEventListener("pointerout", this.upHandler.bind(this))
    elem.addEventListener("pointerleave", this.upHandler.bind(this))
  }

  unregister() {
    const elem = document.getElementById(this.targetDOMId)
    elem.removeEventListener("pointerdown", this.downHandler)
    elem.removeEventListener("pointermove", this.moveHandler)
    elem.removeEventListener("pointerup", this.upHandler)
    elem.removeEventListener("pointercancel", this.upHandler)
    elem.removeEventListener("pointerout", this.upHandler)
    elem.removeEventListener("pointerleave", this.upHandler)
  }

  downHandler(e) {
    this.cache[e.pointerId] = { x: e.clientX, y: e.clientY }
  }

  moveHandler(e) {
    if (!this.cache[e.pointerId]) return
    this.cache[e.pointerId] = { x: e.clientX, y: e.clientY }
    const keys = Object.keys(this.cache)
    if (keys.length === 2) {
      e.preventDefault() // ! does not prevent the actual zoom !
      const a = this.cache[keys[0]]
      const b = this.cache[keys[1]]
      // ! potential performance problems with taking the sqrt
      // * however, using square of the distance means the zoom will not be natural
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (this.lastDistance !== null) {
        const delta = distance - this.lastDistance
        // TODO: apply a scale to the delta value to match the wheel zoom scale in TapestryMain.vue
        this.cb(delta)
        this.debouncedCb()
      }
      this.lastDistance = distance
    }
  }

  upHandler(e) {
    delete this.cache[e.pointerId]
    this.lastDistance = null
  }
}
export default PinchZoom
