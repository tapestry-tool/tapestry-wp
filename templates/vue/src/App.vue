<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <tyde />
    <router-view></router-view>
    <tapestry-sidebar />
    <node-modal
      :node-id="nodeId"
      :parent-id="parentId"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="closeModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import Tyde from "./components/Tyde"
import NodeModal from "@/components/NodeModal"
import TapestrySidebar from "@/components/TapestrySidebar"
import Loading from "./components/Loading"
import client from "./services/TapestryAPI"

export default {
  name: "app",
  components: {
    Tyde,
    NodeModal,
    Loading,
    TapestrySidebar,
  },
  data() {
    return {
      modalType: "",
      nodeId: null,
      parentId: null,
      enableFilter: false,
      loading: true,
    }
  },
  computed: {
    ...mapGetters(["getParent"]),
  },
  mounted() {
    window.addEventListener("click", this.recordAnalytics)
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false
    })

    this.$root.$on("add-node", to => {
      this.modalType = "add"
      this.parentId = to
      this.nodeId = to
      this.$bvModal.show("node-modal")
    })

    this.$root.$on("edit-node", nodeId => {
      this.modalType = "edit"
      const parent = this.getParent(nodeId)
      this.parentId = parent && parent.id
      this.nodeId = nodeId
      this.$bvModal.show("node-modal")
    })
  },
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
  },
  methods: {
    ...mapMutations(["init"]),
    closeModal() {
      this.parentId = null
      this.$bvModal.hide("node-modal")
      this.modalType = ""
    },
    recordAnalytics(evt) {
      const x = evt.clientX + window.scrollLeft
      const y = evt.clientY + window.scrollTop
      client.recordAnalyticsEvent("user", "click", "screen", null, {
        x: x,
        y: y,
      })
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
