<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <router-view></router-view>
    <router-view name="sidebar"></router-view>
    <node-modal
      :node-id="nodeId"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="closeModal"
    />
  </div>
</template>

<script>
import { mapMutations } from "vuex"
import NodeModal from "./components/NodeModal"
import Loading from "./components/Loading"
import client from "./services/TapestryAPI"

export default {
  name: "app",
  components: {
    Loading,
    NodeModal,
  },
  data() {
    return {
      modalType: "",
      nodeId: null,
      loading: true,
    }
  },
  mounted() {
    window.addEventListener("click", this.recordAnalytics)
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false

      if (!this.$route.params.nodeId) {
        this.$router.replace(`/nodes/${dataset.rootId}`)
      }

      this.$router.beforeEach((to, _, next) => {
        if (!to.matched.length) {
          next(`/nodes/${dataset.rootId}`)
        } else {
          next()
        }
      })
    })

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
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
  },
  methods: {
    ...mapMutations(["init"]),
    closeModal() {
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
