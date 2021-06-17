<template>
  <div>
    <multi-content-media
      v-if="node.mediaType === 'multi-content'"
      :node="node"
      :row-id="rowId"
      :sub-row-id="subRowId"
    />
    <!-- @close="handleAutoClose"
    @complete="complete" -->
    <page-menu
      v-if="node.typeData.showNavBar && node.presentationStyle === 'page'"
      :node="node"
      :rowRefs="rowRefs"
      :dimensions="dimensions"
    />
    <!-- <tapestry-media
      v-if="node.mediaType !== 'multi-content'"
      :node-id="nodeId"
      :dimensions="dimensions"
      context="lightbox"
      @load="handleLoad"
      @close="handleAutoClose"
      @complete="complete"
      @change:dimensions="updateDimensions"
    /> -->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"
import MultiContentMedia from "@/components/Lightbox/media/MultiContentMedia"
// import TapestryMedia from "@/components/Lightbox/media/TapestryMedia"
import PageMenu from "@/components/Lightbox/media/MultiContentMedia/PageMenu"
import { names } from "@/config/routes"

const defaultDimensions = {
  top: 100,
  left: 50,
  width: 100,
  height: 100,
}

export default {
  name: "multi-content-tab",
  components: {
    MultiContentMedia,
    // TapestryMedia,
    PageMenu,
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
    dimensions: {
      type: Object,
      required: false,
      default: () => defaultDimensions,
    },
    // show: {
    //   type: Boolean,
    //   required: true,
    // },
    // tab: {
    //   type: String,
    //   required: false,
    //   default: "",
    // },
  },
  data() {
    return {
      rowRefs: [],
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
  },
  watch: {
    rowId: {
      immediate: true,
      handler(rowId) {
        if (rowId) {
          if (
            !this.isMultiContent(this.nodeId) ||
            !this.isMultiContentRow(rowId, this.nodeId)
          ) {
            this.$router.replace({
              name: names.TYDEAPP,
              params: { nodeId: this.nodeId, tab: "multicontent" },
              query: this.$route.query,
            })
          }
        }
      },
    },
    subRowId: {
      immediate: true,
      handler(subRowId) {
        if (subRowId) {
          if (!this.isMultiContentRow(subRowId, this.rowId)) {
            this.$router.replace({
              name: names.ACCORDION,
              params: { nodeId: this.nodeId, rowId: this.rowId },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  mounted() {
    if (this.node.mediaType === "multi-content") {
      this.$root.$on("observe-rows", refs => {
        this.rowRefs = this.rowRefs.concat(refs)
      })
    }
  },
  methods: {
    ...mapActions(["completeNode"]),
    complete() {
      this.completeNode(this.nodeId)
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
