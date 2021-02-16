<template>
  <div :class="['wrapper', { show }]">
    <slot name="toggle"></slot>
    <slot name="content"></slot>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  z-index: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  min-height: 16rem;
  max-height: 80%;
  display: flex;
  flex-direction: column;

  &.show {
    z-index: 10;
    transform: translateY(0);
  }
}
</style>
