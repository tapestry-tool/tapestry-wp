import canvg from "canvg" // this library comes with jsPDF

/**
 * Takes an svg element and returns a JPEG image dataURL of it.
 * @param {SVGElement} svg
 * @param {Number} width
 * @param {Number} height
 */
export const svgToImage = (svg, width, height) => {
  const options = {
    ignoreMouse: true,
    ignoreAnimation: true,
    ignoreDimensions: true,
    ignoreClear: true,
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  canvg.fromString(ctx, svg, options).render(options)

  return canvas.toDataURL("image/jpeg", 1.0)
}
