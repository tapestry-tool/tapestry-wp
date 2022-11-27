<template>
  <div id="tapestry-app" :class="{ 'sidebar-open': isSidebarOpen }">
    <toolbar />
    <tapestry-map
      v-if="settings.renderMap"
      :is-sidebar-open="isSidebarOpen"
      data-qa="tapestry-map"
    />
    <tapestry-main v-else-if="viewingTapestry" ref="graph" />
  </div>
</template>

<script>
import client from "../services/TapestryAPI"
import { names } from "@/config/routes"
import Toolbar from "./Toolbar"
import TapestryMain from "./TapestryMain"
import { mapGetters, mapMutations, mapState } from "vuex"
import TapestryMap from "./TapestryMap"

export default {
  components: {
    TapestryMap,
    Toolbar,
    TapestryMain,
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings"]),
    ...mapGetters(["isEmptyTapestry"]),
    isSidebarOpen() {
      return Boolean(this.$route.query.sidebar) && !this.isEmptyTapestry
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
  beforeDestroy() {
    this.$root.$off("open-node")
    this.$root.$off("edit-node")
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    updateViewBox() {
      this.$refs.graph && this.$refs.graph.updateViewBox()
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
#tapestry-app {
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

      .toolbar {
        padding-right: 1.5vw;
      }
    }
  }
}
</style>

<style lang="scss">
#app {
  background-size: cover;
  #tapestry-app .btn-link {
    background: transparent;
  }
}
</style>
