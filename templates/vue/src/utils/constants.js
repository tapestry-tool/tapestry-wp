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

export const DEFAULT_DEPTH = 3

export const nodeStatuses = {
  PUBLISH: "publish",
  REJECT: "reject",
  ACCEPT: "accept",
  SUBMITTED: "submitted",
  DRAFT: "draft",
}
