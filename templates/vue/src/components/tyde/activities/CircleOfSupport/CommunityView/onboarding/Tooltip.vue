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
// import Helpers from "@/utils/Helpers"
export default {
  data() {
    return {
      positioned: false,
    }
  },
  mounted() {
    this.positioned = true
    this.$emit("tooltip-positioned")
  },
}
</script>

<style scoped lang="scss">
.right {
  right: 22px;
  bottom: 95px;
}
.left {
  left: 22px;
  bottom: 95px;
}
.tooltip-container {
  position: absolute;
  padding: 2rem;
  background: var(--cos-bg-secondary);
  border: var(--cos-border);
  border-radius: 1rem;
  z-index: 100;
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
  bottom: -24px;
}
.right::before,
.right::after {
  right: 25px;
}
.left::before,
.left::after {
  left: 25px;
}
</style>
