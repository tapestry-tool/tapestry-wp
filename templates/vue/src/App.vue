<template>
  <div id="app">
    <tapestry />
    <tapestry-app />
    <router-view v-if="tapestryIsLoaded"></router-view>
    <tapestry-sidebar v-if="tapestryIsLoaded" @edit="editNode" />
  </div>
</template>

<script>
import { mapState } from "vuex"
import Tapestry from "./components/Tapestry"
import TapestryApp from "./components/TapestryApp"
import TapestrySidebar from "./components/TapestrySidebar"

export default {
  name: "app",
  components: {
    Tapestry,
    TapestryApp,
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
