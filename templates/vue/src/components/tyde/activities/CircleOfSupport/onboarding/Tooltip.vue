<template>
  <div
    ref="tooltip"
    class="tooltip-container"
    :style="[
      { opacity: positioned ? 1 : 0 },
      { left: onTopLeftCircleView ? '84px !important' : '0px' },
    ]"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    activeView: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      positioned: false,
      onTopLeftCircleView: false,
    }
  },
  mounted() {
    this.positioned = true
    this.$emit("tooltip-positioned")
    this.onTopLeftCircleView =
      this.$refs.tooltip.classList.contains("top") &&
      this.$refs.tooltip.classList.contains("left") &&
      this.activeView === 0
  },
}
</script>

<style scoped lang="scss">
.right {
  right: 22px;
}

.left {
  left: 22px;

  &.top {
    left: 10px;
  }
}

.top {
  top: 200px;

  &.left {
    top: 110px;
  }
}

.bottom {
  bottom: 95px;
}

.tooltip-container {
  position: absolute;
  padding: 2rem;
  background: white;
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
}

.right::before,
.right::after {
  right: 25px;
}
.left::before,
.left::after {
  left: 25px;
}
.top::before,
.top::after {
  top: -23px;
  border-bottom: 24px solid #fff;
}
.bottom::before,
.bottom::after {
  bottom: -24px;
  border-top: 24px solid #fff;
}
</style>
