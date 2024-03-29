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
    currentEditingNode: null,
    notifications: {
      kaltura: {
        total: 0,
        success: 0,
        error: 0,
      },
    },
    importProgress: null,
  },
  getters,
  mutations,
  actions,
}

export default new Vuex.Store(store)
