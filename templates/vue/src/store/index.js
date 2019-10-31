import Vue from "vue"
import Vuex from "vuex"

import * as actions from "./actions"
import * as mutations from "./mutations"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    groups: [],
    links: [],
    nodes: [],
    rootId: null,
    settings: {},
    selectedNodeId: null,
  },
  getters: {
    selectedNode: state => {
      const { selectedNodeId } = state
      const node = state.nodes.find(node => node.id === selectedNodeId)
      return node || {}
    },
    settings: state => state.settings,
    tapestry: state => state,
    getNode: state => id => {
      return state.nodes.find(node => node.id === id)
    },
  },
  mutations,
  actions,
})

export default store
