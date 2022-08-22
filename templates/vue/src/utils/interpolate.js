import * as d3 from "d3"

const easingFunctions = {
  easeOut: d3.easeCubicOut,
  linear: d3.easeLinear,
}

/**
 * Interpolates between [from] and [to], in [duration] seconds.
 * Calls onChange while value is being changed with the intermediate value as the only argument
 * Calls onComplete when the interpolation finishes
 * @param {any} from
 * @param {any} to
 * @param {Number} duration
 * @param {Function} onChange
 * @param {Function} onComplete
 * @param {String} easing
 */
export function interpolate(
  from,
  to,
  duration,
  onChange = () => {},
  onComplete = () => {},
  easing = "linear"
) {
  const interpolator = d3.interpolate(from, to)
  const timer = d3.timer(elapsed => {
    if (elapsed > duration) {
      onChange(to)
      timer.stop()
      onComplete()
    } else {
      const t = elapsed / duration
      onChange(interpolator(easingFunctions[easing](t)))
    }
  })
}

/**
 * Interpolates number between [from] and [to], in [duration] seconds.
 * Calls onChange while value is being changed with the difference in intermediate value as the only argument
 * Calls onComplete when the interpolation finishes
 * @param {Number} from
 * @param {Number} to
 * @param {Number} duration
 * @param {Function} onChange
 * @param {Function} onComplete
 * @param {String} easing
 */
export function interpolateDelta(
  from,
  to,
  duration,
  onChange = () => {},
  onComplete = () => {},
  easing = "linear"
) {
  const interpolator = d3.interpolateNumber(from, to)
  let lastValue = from
  const timer = d3.timer(elapsed => {
    if (elapsed > duration) {
      onChange(to - lastValue)
      timer.stop()
      onComplete()
    } else {
      const t = elapsed / duration
      const value = interpolator(easingFunctions[easing](t))
      onChange(value - lastValue)
      lastValue = value
    }
  })
}
