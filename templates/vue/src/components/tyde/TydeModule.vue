<template>
  <div :id="`module-${nodeId}`">
    <div :stage="activeStage" @next="next"></div>
  </div>
</template>

<script>
export default {
  name: "tyde-module",
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
