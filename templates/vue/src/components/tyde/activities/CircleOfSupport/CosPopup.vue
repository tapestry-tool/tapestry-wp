<template>
  <div :class="['wrapper', { open: isOpen }]">
    <slot name="toggle" :isOpen="isOpen" :toggle="toggle"></slot>
    <slot name="content"></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: 80%;
  z-index: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;

  &.open {
    transform: translateY(0);
  }
}
</style>
