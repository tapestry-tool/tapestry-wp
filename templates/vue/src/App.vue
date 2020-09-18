<template>
  <div id="app">
    <tyde @add-root="addRootNode" />
    <router-view v-if="tapestryIsLoaded"></router-view>
    <tapestry-filter v-if="tapestryIsLoaded && enableFilter" />
    <node-modal
      v-if="tapestryIsLoaded"
      :node-id="nodeId"
      :parent-id="parentId"
      :modal-type="modalType"
      @cancel="closeModal"
    />
    <tapestry-sidebar v-if="tapestryIsLoaded" @edit="editNode" />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import Tyde from "./components/Tyde"
import TapestryFilter from "./components/TapestryFilter"
import NodeModal from "@/components/NodeModal"
import TapestrySidebar from "@/components/TapestrySidebar"

export default {
  name: "app",
  components: {
    Tyde,
    NodeModal,
    TapestryFilter,
    TapestrySidebar,
  },
  data() {
    return {
      modalType: "",
      nodeId: null,
      parentId: null,
      enableFilter: false,
    }
  },
  computed: {
    ...mapGetters(["getParent"]),
    ...mapState(["tapestryIsLoaded", "selectedNodeId", "getDirectParents"]),
  },
  mounted() {
    window.addEventListener("add-new-node", this.addNewNode)
    window.addEventListener("edit-node", this.editNode)
  },
  methods: {
    addRootNode() {
      this.modalType = "add"
      this.$bvModal.show("node-modal")
    },
    addNewNode() {
      this.modalType = "add"
      this.nodeId = this.selectedNodeId
      this.parentId = this.selectedNodeId
      this.$bvModal.show("node-modal")
    },
    editNode() {
      this.modalType = "edit"
      this.nodeId = this.selectedNodeId
      const parent = this.getParent(this.selectedNodeId)
      this.parentId = parent && parent.id
      this.$bvModal.show("node-modal")
    },
    closeModal() {
      this.parentId = null
      this.modalType = ""
    },
  },
}
</script>

<style lang="scss">
html {
  font-size: 100%;

  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    h1,
    h2,
    h3,
    h4,
    h5 {
      &::before {
        display: none;
      }
    }

    p {
      padding: 0;
    }

    button:focus {
      outline: none;
    }
  }
}
</style>
