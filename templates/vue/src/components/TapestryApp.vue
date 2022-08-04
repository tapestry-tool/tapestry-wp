<template>
  <div id="app-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <tapestry-map
      v-if="settings.renderMap"
      :is-sidebar-open="isSidebarOpen"
      data-qa="tapestry-map"
    />
    <tapestry-main v-else-if="viewingTapestry" ref="graph" />
    <tapestry-title />
    <tapestry-toolbar />
    <tapestry-menubar />
  </div>
</template>

<script>
import client from "../services/TapestryAPI"
import { names } from "@/config/routes"
import TapestryMenubar from "./TapestryMenubar"
import TapestryMain from "./TapestryMain"
import { mapMutations, mapState } from "vuex"
import TapestryMap from "./TapestryMap"
import TapestryTitle from "./TapestryTitle"
import TapestryToolbar from "./TapestryToolbar/index.vue"

export default {
  components: {
    TapestryMap,
    TapestryMenubar,
    TapestryMain,
    TapestryTitle,
    TapestryToolbar,
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId"]),
    isSidebarOpen() {
      return Boolean(this.$route.query.sidebar)
    },
    viewingTapestry() {
      return (
        !this.$route.name ||
        this.$route.name !== names.LIGHTBOX ||
        !this.nodes[this.$route.params.nodeId].fullscreen
      )
    },
    analyticsEnabled() {
      return this.settings.analyticsEnabled
    },
  },
  watch: {
    analyticsEnabled: {
      immediate: true,
      handler(analyticsEnabled) {
        client.enableAnalytics(analyticsEnabled)
      },
    },
  },
  mounted() {
    this.$root.$on("open-node", id => {
      this.openNode(id)
    })
    this.$root.$on("edit-node", id => {
      this.editNode(id)
    })
    client.recordAnalyticsEvent("app", "load", "tapestry")
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    updateViewBox() {
      this.$refs.graph && this.$refs.graph.updateViewBox()
    },
    getNodeDimensions() {
      this.$refs.graph && this.$refs.graph.getNodeDimensions()
    },
    openNode(id) {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: id },
        query: this.$route.query,
      })
    },
    editNode(id) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "content" },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#app-container {
  position: relative;
  transform: scale(1);
  transform-origin: top left;
  transition: all 0.2s ease-out;
  width: 100%;
  z-index: 0;

  @media screen and (min-width: 500px) {
    width: calc(100% - 2.5em);

    &.sidebar-open {
      width: calc(100% - min(400px, max(300px, 25vw)) - 2.5em);
      padding-right: 0;

      .tapestry-menubar {
        padding-right: 1.5vw;
      }
    }
  }
}
</style>

<style lang="scss">
#app {
  background-size: cover;
}
#app-container .btn-link {
  background: transparent;
}
</style>
