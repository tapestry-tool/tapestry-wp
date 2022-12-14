import Vue from "vue"
import Vuex from "vuex"

import * as actions from "./actions"
import * as mutations from "./mutations"
import * as getters from "./getters"
import CommandHistory from "@/utils/CommandHistory"

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
    displayErrors: true,
    theme: "",
    userAnswers: {},
    returnRoute: null,
    browserDimensions: {
      width: 0,
      height: 0,
    },
    currentEditingNode: null,
    commandHistory: new CommandHistory(),
    nodeNavigation: {
      stack: [],
      siblings: [],
      siblingPosition: -1,
      linkMode: false,
    },
    fullscreenDropzone: {
      active: false,
      file: null,
    },
    // * DEV: temporarily allow editing constants.js/scaleConstants
    scaleConstants: {
      largeNodeGrowthSupressor: 1.3, // [>=1] higher -> larger nodes grow slower
      lineWidthRatio: 0.05, // higher -> links are thicker
      widthDifferenceEnhancer: {
        grow: 2, // [>=1] higher -> links are thicker at parent end
        shrink: 0.4, // [<=1] lower -> links are thinner at child end
      },
      zoomSensitivity: 0.8, // higher -> zooms in/out faster
      panSensitivity: 1, // higher -> pans faster (keep it at 1 for natural pan)
      maxNodeSizeToScreen: 0.15, // max. allowed value of: (radius of the deepest node) / min(viewWidth, viewHeight)
      minTapestrySizeToScreen: 0.6, // min. allowed value of: tapestryWidth / viewWidth
      disableOffsetClamp: false,
    },
    currentTool: null,
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
