<template>
  <div id="app">
    <tapestry @add-root="addRootNode" />
    <router-view v-if="tapestryIsLoaded"></router-view>
    <tapestry-filter v-if="tapestryIsLoaded" />
    <node-modal
      v-if="tapestryIsLoaded"
      :node-id="nodeId"
      :modal-type="modalType"
      @cancel="closeModal"
    />
    <tapestry-sidebar v-if="tapestryIsLoaded" @edit="editNode" />
  </div>
</template>

<script>
import { mapState } from "vuex"
import Tapestry from "./components/Tapestry"
import TapestryFilter from "./components/TapestryFilter"
import NodeModal from "@/components/NodeModal"
import TapestrySidebar from "@/components/TapestrySidebar"

export default {
  name: "app",
  components: {
    NodeModal,
    Tapestry,
    TapestryFilter,
    TapestrySidebar,
  },
  data() {
    return {
      modalType: "",
      nodeId: null,
    }
  },
  computed: {
    ...mapState(["tapestryIsLoaded", "selectedNodeId"]),
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
      this.$bvModal.show("node-modal")
    },
    editNode() {
      this.modalType = "edit"
      this.nodeId = this.selectedNodeId
      this.$bvModal.show("node-modal")
    },
    closeModal() {
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

    h1:before {
      content: none;
    }

    p {
      padding: 0;
    }

    a {
      color: #42b983;
    }

    button:focus {
      outline: none;
    }
  }
}
</style>
