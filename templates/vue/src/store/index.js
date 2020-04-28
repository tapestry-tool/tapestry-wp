import Vue from "vue"
import Vuex from "vuex"

import * as actions from "./actions"
import * as mutations from "./mutations"
import * as getters from "./getters"

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
    tapestryIsLoaded: false,
    favourites: [],
  },
  getters: {
    selectedNode: state => {
      const { selectedNodeId } = state
      const node = state.nodes[Helpers.findNodeIndex(selectedNodeId, state)]
      return node || {}
    },
    settings: state => state.settings,
    tapestry: state => state,
    getDirectChildren: state => id => {
      const links = state.links
      return links.filter(link => link.source.id == id).map(link => link.target.id)
    },
    getDirectParents: state => id => {
      return state.links
        .filter(link => link.target.id == id)
        .map(link => link.source.id)
    },
    getNode: state => id => state.nodes[Helpers.findNodeIndex(id, state)],
    getNodeProgress: state => id => state.progress[id],
    nodes: state => state.nodes,
    lightbox: state => ({
      id: state.lightboxId,
      isOpen: state.isLightboxOpen,
      el: state.lightboxEl,
    }),
    getFavourites: state => state.favourites,
    ...getters,
  },
  mutations,
  actions,
})

// sets dataset every time the state changes
store.subscribe((_, state) => thisTapestryTool.setDataset(state))

export default store
