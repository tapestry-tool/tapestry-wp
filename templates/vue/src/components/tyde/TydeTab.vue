<template>
  <li @click="$emit('click')" :class="['tab', { 'tab-active': isActive }]">
    <i class="far fa-eye icon"></i>
    <slot></slot>
  </li>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  name: 'tyde-tab',
}
</script>

<style scoped>
.icon {
  font-size: 1.8em;
  margin-bottom: 8px;
}

.tab {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  opacity: 0.5;
  text-align: center;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.tab:hover,
.tab-active {
  opacity: 1;
}
</style>
