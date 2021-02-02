<template>
  <div :class="['wrapper', { open: isOpen }]">
    <slot name="toggle" :isOpen="isOpen" :toggle="toggle"></slot>
    <div class="content-wrapper">
      <slot name="content"></slot>
    </div>
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
    z-index: 10;
    transform: translateY(0);
  }
}

.content-wrapper {
  background: white;
  position: relative;
  z-index: 10;
  padding: 3rem;
  height: 100%;
  border-top: 1px solid var(--cos-color-tertiary);
}
</style>
