<template>
  <div :id="`module-${nodeId}`" class="module-wrapper">
    <tyde-stage :node-id="activeStage" @next="next"></tyde-stage>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import TydeStage from "./TydeStage"

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
    ...mapGetters(["getNode", "getDirectChildren", "lightbox"]),
    node() {
      return this.getNode(this.nodeId)
    },
    stages() {
      return this.getDirectChildren(this.nodeId)
    },
    activeStage() {
      return this.stages[this.activeStageIndex]
    },
  },
  watch: {
    activeStage(newStage) {
      if (this.lightbox.isOpen) {
        this.closeLightbox()
      }
      this.openLightbox(newStage)
    },
  },
  mounted() {
    this.openLightbox(this.activeStage)
  },
  methods: {
    ...mapMutations(["openLightbox", "closeLightbox"]),
    next() {
      if (this.activeStageIndex < this.stages.length - 1) {
        this.activeStageIndex++
      } else {
        this.openLightbox(this.nodeId)
        this.$emit("done")
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
