<template>
  <div :id="`module-${nodeId}`">
    <tyde-stage :node-id="activeStage" @next="next"></tyde-stage>
  </div>
</template>

<script>
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
    stages() {
      return []
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

<style scoped></style>
