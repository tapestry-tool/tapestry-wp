<template>
  <li :class="['tab', { 'active': isActive }]" @click="$emit('click')">
    <i class="far fa-eye icon"></i>
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: "tyde-tab",
  props: {
    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>

.tab {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-weight: bold;
  line-height: 1;
  margin: 0 30px;
  opacity: 0.5;
  text-align: center;
  text-transform: uppercase;
  transition: all 0.2s ease;

  &:hover,
  &.active {
    opacity: 1;
  }

  .icon {
    font-size: 1.3em;
    margin-bottom: 8px;
  }
}
</style>
