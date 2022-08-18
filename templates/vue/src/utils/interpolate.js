import * as d3 from "d3"

const easingFunction = d3.easeCubicOut

/**
 * Interpolates number between [from] and [to], in [duration] seconds.
 * Calls onChange while value is being changed with the intermediate value as the only argument
 * Calls onComplete when the interpolation finishes
 * @param {Number} from
 * @param {Number} to
 * @param {Number} duration
 * @param {Function} onChange
 * @param {Function} onComplete
 */
export function interpolate(
  from,
  to,
  duration,
  onChange = () => {},
  onComplete = () => {}
) {
  const interpolator = d3.interpolateNumber(from, to)
  const timer = d3.timer(elapsed => {
    if (elapsed > duration) {
      onChange(to)
      timer.stop()
      onComplete()
    } else {
      const t = elapsed / duration
      onChange(interpolator(easingFunction(t)))
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
 */
export function interpolateDelta(
  from,
  to,
  duration,
  onChange = () => {},
  onComplete = () => {}
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
      const value = interpolator(easingFunction(t))
      onChange(value - lastValue)
      lastValue = value
    }
  })
}
