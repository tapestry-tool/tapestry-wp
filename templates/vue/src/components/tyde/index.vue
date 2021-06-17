<template>
  <tyde-modal
    id="tydebox"
    data-qa="tydebox"
    :class="{
      'full-screen': node.fullscreen,
      'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
    }"
    :content-container-style="tydeContentStyles"
    :allow-close="canSkip"
    @close="handleUserClose"
  >
    <multi-content-tab
      v-if="node.mediaType === 'multi-content'"
      :nodeId="nodeId"
      :row-id="rowId"
      :sub-row-id="subRowId"
      :dimensions="dimensions"
      @close="handleAutoClose"
      @complete="complete"
    />
  </tyde-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import TydeModal from "./TydeModal"
import MultiContentTab from "./MultiContentTab"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import DragSelectModular from "@/utils/dragSelectModular"

export default {
  name: "tyde-app",
  components: {
    MultiContentTab,
    TydeModal,
  },
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
    rowId: {
      type: Number,
      required: false,
      default: 0,
    },
    subRowId: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      dimensions: {
        top: 100,
        left: 50,
      },
    }
  },
  computed: {
    ...mapState(["h5pSettings", "rootId"]),
    ...mapGetters(["getNode", "isMultiContent", "isMultiContentRow"]),
    node() {
      const node = this.getNode(this.nodeId)
      return node
    },
    canSkip() {
      return this.node.completed || this.node.skippable !== false
    },
    tydeContentStyles() {
      const styles = {
        top: this.dimensions.top + "px",
        left: this.dimensions.left + "px",
        width: this.dimensions.width + "px",
        height: this.dimensions.height + "px",
      }

      if (this.node.fullscreen) {
        styles.top = "auto"
        styles.left = "auto"
        styles.width = "100vw"
        styles.height = "100vh"
        styles.position = "relative"
      }

      if (this.node.mediaType === "multi-content") {
        styles.display = "flex"
        // Reversed because PageMenu is placed after MultiContentMedia for refs to correctly render
        styles.flexDirection = "row-reverse"
        return Object.assign(styles, { padding: "24px" })
      }

      if (this.node.mediaType === "text" || this.node.mediaType === "wp-post") {
        return Object.assign(styles, {
          background: "#eee",
          color: "#333",
          padding: "1em",
        })
      }
      return styles
    },
    tydeModalOpen: {
      get() {
        return this.$route.name === names.SETTINGS
      },
      set(open) {
        this.$router.push({
          name: open ? names.SETTINGS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "appearance" },
          query: this.$route.query,
        })
      },
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    nodeId: {
      immediate: true,
      handler() {
        if (!this.node) {
          // Node ID doesn't exist, so reroute to default selected node
          this.$router.replace({
            name: names.APP,
            params: { nodeId: this.rootId },
            query: this.$route.query,
          })
        } else {
          this.applyDimensions()
        }
      },
    },
  },
  mounted() {
    document.querySelector("body").classList.add("tydebox-open")
    DragSelectModular.removeDragSelectListener()
  },
  beforeDestroy() {
    document.querySelector("body").classList.remove("tydebox-open")
    DragSelectModular.addDragSelectListener()
    this.$router.push({
      ...this.$route,
      query: { ...this.$route.query, row: undefined },
    })
  },
  methods: {
    ...mapActions(["completeNode"]),
    complete() {
      this.completeNode(this.nodeId)
    },
    handleUserClose() {
      client.recordAnalyticsEvent("user", "close", "tydebox", this.nodeId)
      this.close()
    },
    handleAutoClose() {
      client.recordAnalyticsEvent("app", "close", "tydebox", this.nodeId)
      this.close()
    },
    changeTab(tab) {
      this.$router.push({
        name: names.TYDEAPP,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
    close() {
      this.$router.push({
        name: names.APP,
        params: { nodeId: this.nodeId },
        query: this.$route.query,
      })
    },
    handleLoad(dimensions) {
      if (dimensions) {
        const { width, height } = dimensions
        this.updateDimensions({ width, height })
      }
    },
    updateDimensions(dimensions) {
      this.dimensions = {
        ...this.dimensions,
        ...dimensions,
      }
    },
    applyDimensions() {
      const browserWidth = Helpers.getBrowserWidth()
      const browserHeight = Helpers.getBrowserHeight()
      this.dimensions = {
        ...this.dimensions,
        width: browserWidth,
        height: browserHeight,
      }
    },
  },
}
</script>

<style lang="scss">
body.tydebox {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.content-text {
  .media-wrapper {
    overflow: auto;
  }
}

#tydebox {
  &.full-screen {
    background: #000;
  }
  height: 100%;
}
</style>
