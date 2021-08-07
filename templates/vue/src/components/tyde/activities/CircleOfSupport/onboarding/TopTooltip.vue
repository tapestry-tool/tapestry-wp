<template>
  <div
    ref="tooltip"
    class="tooltip-container"
    :class="{
      'on-circle-view': onCircleView,
    }"
    :style="{ opacity: positioned ? 1 : 0 }"
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
    }
  },
  computed: {
    onCircleView() {
      return this.activeView === 1
    },
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
  top: 200px;
}

.left {
  left: 10px;
  top: 110px;
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
  border-bottom: 24px solid #fff;
  top: -23px;
  z-index: 5;

  &.on-circle-view {
    border-left: 24px solid transparent;
    border-right: 24px solid transparent;
    border-bottom: 24px solid #bbb;
    top: -23px;
    z-index: 5;
  }
}

.tooltip-container::after {
  content: "";
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 24px solid #bbb;
  top: -23px;

  &.on-circle-view {
    border-left: 24px solid transparent;
    border-right: 24px solid transparent;
    border-bottom: 24px solid #bbb;
    top: -23px;
  }
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
