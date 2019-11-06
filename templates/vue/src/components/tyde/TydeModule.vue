<template>
  <div :id="`module-${nodeId}`" class="wrapper">
    <p>
      <code>{{ node.title }}</code>
    </p>
    <tyde-stage :node-id="activeStage" @next="next"></tyde-stage>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeStage from "./TydeStage"

export default {
  name: "tyde-module",
  components: {
    TydeStage,
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
  methods: {
    next() {
      this.activeStageIndex++
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
  padding: 80px;
}
</style>
