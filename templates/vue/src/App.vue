<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else id="app">
    <tapestry-app></tapestry-app>
    <router-view name="lightbox"></router-view>
    <node-modal></node-modal>
    <tapestry-sidebar></tapestry-sidebar>
  </div>
</template>

<script>
import { mapMutations } from "vuex"
import Loading from "./components/Loading"
import NodeModal from "./components/NodeModal"
import TapestryApp from "./components/TapestryApp"
import TapestrySidebar from "./components/TapestrySidebar"
import client from "./services/TapestryAPI"

export default {
  name: "app",
  components: {
    Loading,
    NodeModal,
    TapestryApp,
    TapestrySidebar,
  },
  data() {
    return {
      loading: true,
    }
  },
  mounted() {
    window.addEventListener("click", this.recordAnalytics)
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false

      if (!this.$route.params.nodeId && dataset.nodes.length > 0) {
        this.$router.replace(`/nodes/${dataset.rootId}`)
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener("click", this.recordAnalytics)
  },
  methods: {
    ...mapMutations(["init"]),
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
