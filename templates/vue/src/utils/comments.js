import moment from "moment-timezone"
import * as wp from "@/services/wp"

export const types = {
  COMMENT: "Comment",
  STATUS_CHANGE: "StatusChange",
}

export const createComment = (type, data) => ({
  timestamp: moment().toISOString(),
  author: wp.getCurrentUser(),
  type,
  ...data,
})
