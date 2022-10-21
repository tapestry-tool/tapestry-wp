import Vue from "vue"
import Vuex from "vuex"

import * as actions from "./actions"
import * as mutations from "./mutations"
import * as getters from "./getters"

Vue.use(Vuex)

export const store = {
  state: {
    groups: [],
    links: [],
    nodes: [],
    maxLevel: 1,
    currentDepth: 3,
    progress: {},
    rootId: null,
    settings: {},
    selection: [],
    h5pSettings: {},
    selectedNodeId: null,
    favourites: [],
    visibleNodes: [],
    apiError: null,
    displayErrors: false,
    theme: "",
    userAnswers: {},
    returnRoute: null,
    currentEditingNode: null,
    // * DEV: temporarily allow editing constants.js/scaleConstants
    scaleConstants: {
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
      disableOffsetClamp: false,
    },
    notifications: {
      kaltura: {
        total: 0,
        success: 0,
        error: 0,
      },
    },
  },
  getters,
  mutations,
  actions,
}

export default new Vuex.Store(store)
