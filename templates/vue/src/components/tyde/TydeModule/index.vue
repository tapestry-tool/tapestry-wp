<template>
  <div :id="`module-${nodeId}`" class="module-wrapper">
    <tyde-stage
      :node-id="activeStage"
      :stage-index="activeStageIndex"
      @next="next"
      @close="$emit('done')"
      @prev="prev"
    ></tyde-stage>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import TydeStage from "./TydeStage"
import client from "@/services/TapestryAPI"

export default {
  name: "tyde-module",
  components: {
    TydeStage,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      activeStageIndex: 0,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    node() {
      return this.getNode(this.nodeId)
    },
    stages() {
      return this.node.childOrdering
    },
    activeStage() {
      return this.stages[this.activeStageIndex]
    },
    isLightboxOpen() {
      return this.$route.path.includes("nodes")
    },
  },
  watch: {
    activeStage(newStage) {
      if (this.isLightboxOpen) {
        client.recordAnalyticsEvent("app", "close", "lightbox", newStage)
        this.closeLightbox()
      }
      client.recordAnalyticsEvent("app", "open", "lightbox", newStage)
      this.openLightbox(newStage)
    },
  },
  mounted() {
    client.recordAnalyticsEvent("app", "open", "lightbox", this.activeStage)
    this.openLightbox(this.activeStage)
  },
  methods: {
    ...mapMutations(["openLightbox", "closeLightbox"]),
    openLightbox(id) {
      this.$router.push(`/nodes/${id}`)
    },
    closeLightbox() {
      this.$router.push(`/`)
    },
    next() {
      if (this.activeStageIndex < this.stages.length - 1) {
        this.activeStageIndex++
        client.recordAnalyticsEvent("app", "next", "stage", this.nodeId, {
          from: this.activeStageIndex - 1,
          to: this.activeStageIndex,
        })
      } else {
        client.recordAnalyticsEvent("app", "open", "lightbox", this.nodeId)
        this.openLightbox(this.nodeId)
        this.$emit("done")
      }
    },
    prev() {
      if (this.activeStageIndex > 0) {
        this.activeStageIndex--
        client.recordAnalyticsEvent("app", "prev", "stage", this.nodeId, {
          from: this.activeStageIndex + 1,
          to: this.activeStageIndex,
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.module-wrapper {
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  padding: 0;
}
</style>
