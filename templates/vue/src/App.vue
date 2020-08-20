<template>
  <div id="app">
    <tapestry-app />
    <router-view v-if="tapestryIsLoaded"></router-view>
    <tapestry-sidebar v-if="tapestryIsLoaded" />
    <node-modal
      :node-id="nodeId"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="closeModal"
    />
  </div>
</template>

<script>
import { mapState } from "vuex"
import NodeModal from "./components/NodeModal"
import TapestryApp from "./components/TapestryApp"
import TapestrySidebar from "./components/TapestrySidebar"

export default {
  name: "app",
  components: {
    NodeModal,
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
  watch: {
    tapestryIsLoaded() {
      this.$router.start()
    },
  },
  mounted() {
    this.$root.$on("add-node", to => {
      this.modalType = "add"
      this.nodeId = to
      this.$bvModal.show("node-modal")
    })

    this.$root.$on("edit-node", nodeId => {
      this.modalType = "edit"
      this.nodeId = nodeId
      this.$bvModal.show("node-modal")
    })
  },
  methods: {
    closeModal() {
      this.$bvModal.hide("node-modal")
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
