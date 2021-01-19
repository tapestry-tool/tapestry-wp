export const conditionTypes = {
  NODE_COMPLETED: "node_completed",
  DATE_NOT_PASSED: "date_not_passed",
  DATE_PASSED: "date_passed",
}

export const sizes = {
  NODE_RADIUS: 140,
  NODE_RADIUS_SELECTED: 210,
}

export const tydeTypes = {
  REGULAR: "Regular",
  MODULE: "Module",
  STAGE: "Stage",
  QUESTION_SET: "Question set",
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
