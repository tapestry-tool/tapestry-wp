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
    // const container = document.getElementById("cos")
    // const target = container.querySelector(`#${this.refId}`)
    const tooltip = this.$refs.tooltip

    // Temporary fix of positioning
    tooltip.style.right = "22px";
    tooltip.style.bottom = "95px";
    // const { x, y } = Helpers.positionTooltip(target, tooltip, container, {
    //   dryRun: true,
    // })
    // tooltip.style.transform = `translate(${x}px, ${y -
    //   tooltip.clientHeight -
    //   target.clientHeight}px)`
    this.positioned = true
  },
}
</script>

<style scoped lang="scss">
.tooltip-container {
  position: absolute;
  padding: 2rem;
  background: white;
  border: var(--cos-border);
  border-radius: 1rem;
}

.tooltip-container::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-top: 24px solid #fff;
  bottom: -23px;
  right: 25px;
  z-index: 5;
}

.tooltip-container::after {
  content: "";
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-top: 24px solid #bbb;
  bottom:-24px;
  right: 25px;
}
</style>
