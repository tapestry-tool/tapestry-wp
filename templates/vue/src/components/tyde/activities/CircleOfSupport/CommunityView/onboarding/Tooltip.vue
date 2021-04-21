<template>
  <div
    ref="tooltip"
    class="tooltip-container"
    :style="{ opacity: positioned ? 1 : 0 }"
  >
    <slot></slot>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
export default {
  props: {
    /**
     * ID of the DOM element that we want to position this tooltip against.
     */
    refId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      positioned: false,
    }
  },
  mounted() {
    const container = document.getElementById("cos")
    const target = container.querySelector(`#${this.refId}`)
    const tooltip = this.$refs.tooltip

    const { x, y } = Helpers.positionTooltip(target, tooltip, container, {
      dryRun: true,
    })
    tooltip.style.transform = `translate(${x}px, ${y -
      tooltip.clientHeight -
      target.clientHeight}px)`
    this.positioned = true
  },
}
</script>

<style scoped>
.tooltip-container {
  position: absolute;
  top: 0;
  left: 0;
  padding: 2rem;
  background: white;
  border: var(--cos-border);
  border-radius: 1rem;
}
</style>
