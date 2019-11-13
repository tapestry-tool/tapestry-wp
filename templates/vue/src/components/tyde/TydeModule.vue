<template>
  <div :id="`module-${nodeId}`" class="wrapper">
    <tyde-stage
      v-show="!isLightboxOpen"
      :node-id="activeStage"
      @next="next"
    ></tyde-stage>
    <lightbox v-if="isLightboxOpen" :node-id="lightboxId" @close="closeLightbox" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeStage from "./TydeStage"
import Lightbox from "../Lightbox"

export default {
  name: "tyde-module",
  components: {
    TydeStage,
    Lightbox,
  },
  props: {
    nodeId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      activeStageIndex: 0,
      isLightboxOpen: false,
      lightboxId: null,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
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
      if (this.isLightboxOpen) {
        this.closeLightbox()
      }
      this.openLightbox(newStage)
    },
  },
  mounted() {
    this.openLightbox(this.activeStage)
  },
  methods: {
    next() {
      this.activeStageIndex++
      if (this.activeStageIndex >= this.stages.length) {
        this.$emit("done")
      }
    },
    openLightbox(id) {
      this.isLightboxOpen = true
      this.lightboxId = id
    },
    closeLightbox() {
      this.isLightboxOpen = false
      this.lightboxId = null
    },
  },
}
</script>

<style scoped>
.wrapper {
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
