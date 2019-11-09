import Vue from "vue"
import Vuex from "vuex"

import * as actions from "./actions"
import * as mutations from "./mutations"

import Helpers from "../utils/Helpers"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    groups: [],
    links: [],
    nodes: [],
    progress: {},
    rootId: null,
    settings: {},
    h5pSettings: {},
    selectedNodeId: null,
    lightboxId: null,
    isLightboxOpen: false,
    lightboxEl: null,
  },
  getters: {
    selectedNode: state => {
      const { selectedNodeId } = state
      const node = state.nodes[Helpers.findNodeIndex(selectedNodeId, state)]
      return node || {}
    },
    settings: state => state.settings,
    tapestry: state => state,
    getNode: state => id => state.nodes[Helpers.findNodeIndex(id, state)],
    getNodeProgress: state => id => state.progress[id],
    lightbox: state => ({
      id: state.lightboxId,
      isOpen: state.isLightboxOpen,
      el: state.lightboxEl,
    }),
  },
  mutations,
  actions,
})

// sets dataset every time the state changes
store.subscribe((_, state) => thisTapestryTool.setDataset(state))

export default store
