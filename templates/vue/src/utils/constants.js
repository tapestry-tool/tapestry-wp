export const conditionTypes = {
  NODE_COMPLETED: "node_completed",
  DATE_NOT_PASSED: "date_not_passed",
  DATE_PASSED: "date_passed",
}

export const sizes = {
  NODE_RADIUS: 140,
  NODE_RADIUS_SELECTED: 210,
}

export const licenseTypes = {
  CREATIVE_COMMONS: "cc",
  CUSTOM: "custom",
}

export const licenses = {
  [licenseTypes.CREATIVE_COMMONS]: {
    name: "CC-BY-SA",
    icons: [
      "fab fa-creative-commons",
      "fab fa-creative-commons-by",
      "fab fa-creative-commons-sa",
    ],
  },
  [licenseTypes.CUSTOM]: {
    name: "Custom license",
    icons: ["fas fa-plus"],
  },
}

export const nodeStatus = {
  PUBLISH: "publish",
  DRAFT: "draft",
  SUBMIT: "submitted",
  REJECT: "rejected",
  ACCEPT: "accepted",
}

export const userActions = {
  READ: "read",
  ADD: "add",
  EDIT: "edit",
}

export const DEFAULT_DEPTH = 3

// * DEV: this is not used; use store.state.scaleConstants temporarily
export const scaleConstants = {
  levelMultiplier: 1.7, // higher -> deep nodes get revealed faster
  largeNodeGrowthSupressor: 1.3, // [>=1] higher -> larger nodes grow slower
  lineWidthRatio: 0.05, // higher -> links are thicker
  widthDifferenceEnhancer: {
    grow: 1.8, // [>=1] higher -> links are thicker at parent end
    shrink: 0.4, // [<=1] lower -> links are thinner at child end
  },
  zoomSensitivity: 0.8, // higher -> zooms in/out faster
  panSensitivity: 1, // higher -> pans faster (keep it at 1 for natural pan)
  maxNodeSizeToScreen: 0.15, // max. allowed value of: (radius of the deepest node) / min(viewWidth, viewHeight)
  minTapestrySizeToScreen: 0.6, // min. allowed value of: tapestryWidth / viewWidth
}
