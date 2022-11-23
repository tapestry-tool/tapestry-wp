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
    visibleNodeParents: {
      nodes: [],
      links: [],
    },
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
