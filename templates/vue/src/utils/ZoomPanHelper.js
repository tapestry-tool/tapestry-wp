import Helpers from "./Helpers"
import { interpolateDelta } from "./interpolate"
class ZoomPanHelper {
  onZoom
  onZoomEnd
  onPan
  onPanEnd
  isZooming
  cache
  lastDistance
  pinchPoint
  isPanning
  panPoint
  lastClickTime
  excludedElements
  clickableDOMIds

  constructor(
    targetDOMId,
    onZoom,
    onZoomEnd,
    onPan,
    onPanEnd,
    excludedElements = [],
    clickableDOMIds = []
  ) {
    this.onZoom = onZoom
    this.onZoomEnd = Helpers.debounce(onZoomEnd)
    this.onPan = onPan
    this.onPanEnd = Helpers.debounce(onPanEnd)
    this.targetDOMId = targetDOMId

    this.isZooming = false
    this.cache = {}
    this.lastDistance = null
    this.pinchPoint = { x: 0, y: 0 }

    this.isPanning = false
    this.panPoint = { x: 0, y: 0 }

    this.lastClickTime = null
    this.excludedElements = excludedElements
    this.clickableDOMIds = clickableDOMIds
  }

  register() {
    const elem = document.getElementById(this.targetDOMId)
    if (elem) {
      // catch panning with mouse
      elem.addEventListener("mousedown", this.panStartHandler.bind(this))
      elem.addEventListener("mousemove", this.panMoveHandler.bind(this))
      elem.addEventListener("mouseup", this.panEndHandler.bind(this))
      elem.addEventListener("mouseleave", this.panEndHandler.bind(this))
      // catch wheel zoom event for MacOS trackpad pinch zoom
      elem.addEventListener("wheel", this.wheelHandler.bind(this), {
        passive: false,
      })
      // catch 2-finger pinch zoom on mobile browsers
      elem.addEventListener("touchstart", this.startHandler.bind(this))
      elem.addEventListener("touchmove", this.moveHandler.bind(this))
      elem.addEventListener("touchcancel", this.endHandler.bind(this))
      elem.addEventListener("touchend", this.endHandler.bind(this))
      // catch double click to zoom
      elem.addEventListener("click", this.clickHandler.bind(this))
    }
  }

  unregister() {
    const elem = document.getElementById(this.targetDOMId)
    if (elem) {
      elem.removeEventListener("mousedown", this.panStartHandler.bind(this))
      elem.removeEventListener("mousemove", this.panMoveHandler.bind(this))
      elem.removeEventListener("mouseup", this.panEndHandler.bind(this))
      elem.removeEventListener("mouseleave", this.panEndHandler.bind(this))
      elem.removeEventListener("wheel", this.wheelHandler.bind(this), {
        passive: false,
      })
      elem.removeEventListener("touchstart", this.startHandler.bind(this))
      elem.removeEventListener("touchmove", this.moveHandler.bind(this))
      elem.removeEventListener("touchcancel", this.endHandler.bind(this))
      elem.removeEventListener("touchend", this.endHandler.bind(this))
      elem.removeEventListener("click", this.clickHandler.bind(this))
    }
  }

  panStartHandler(e) {
    if (!this.isZooming && this._isValidLocation(e)) {
      this.isPanning = true
      this.panPoint = { x: e.clientX, y: e.clientY }
    }
  }

  panMoveHandler(e) {
    if (this.isPanning) {
      const x = e.clientX
      const y = e.clientY
      this.onPan(x - this.panPoint.x, y - this.panPoint.y)
      this.panPoint.x = x
      this.panPoint.y = y
      this.onPanEnd()
    }
  }

  panEndHandler() {
    if (this.isPanning) {
      this.isPanning = false
      this.panPoint = { x: 0, y: 0 }
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
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      // panning has higher priority than trackpad pinch zoom
      if (!this.isPanning) {
        this.onZoom(-0.01 * e.deltaY, e.offsetX, e.offsetY)
        this.onZoomEnd()
      }
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
      this.isZooming = true
      // zooming has higher priority than panning
      this.isPanning = false
    }
  }

  moveHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length === 2) {
      for (const touch of e.targetTouches) {
        if (!this.cache[touch.identifier]) {
          this.isZooming = false
          return
        }
        this.cache[touch.identifier] = { x: touch.clientX, y: touch.clientY }
      }
      const distance = this._calcDistance()
      if (distance !== null && this.lastDistance !== null) {
        const delta = distance - this.lastDistance
        const scaleDelta = delta * 0.01
        this.onZoom(scaleDelta, this.pinchPoint.x, this.pinchPoint.y)
        this.onZoomEnd()
      }
      this.lastDistance = distance
    }
  }

  endHandler(e) {
    e.preventDefault()
    if (e.targetTouches.length !== 2) {
      this.isZooming = false
      this.cache = {}
      this.pinchPoint = { x: 0, y: 0 }
    }
    this.lastDistance = null
  }

  clickHandler(e) {
    if (
      !e.target.id ||
      !(
        e.target.id === this.targetDOMId ||
        this.clickableDOMIds.includes(e.target.id)
      )
    ) {
      return
    }
    const time = Date.now()
    if (this.lastClickTime && time - this.lastClickTime <= 300) {
      // the second click of double click
      const scaleDelta = 1
      const { offsetX, offsetY } = e
      interpolateDelta(
        0,
        scaleDelta,
        600,
        delta => {
          this.onZoom(delta, offsetX, offsetY)
          this.lastClickTime = null
        },
        () => {
          this.onZoomEnd()
        }
      )
      this.lastClickTime = null // to prevent triple clicks...
    } else {
      this.lastClickTime = time
    }
  }

  _isValidLocation(e) {
    return this.excludedElements.every(el => !el.contains(e.target))
  }
}
export default ZoomPanHelper
