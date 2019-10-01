<template>
  <li @click="$emit('click', tab)" :class="['tab', { 'tab-active': isActive }]">
    See {{ tab }}
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
    tab: {
      type: String,
      required: true,
    },
  },
  name: 'tyde-tab',
}
</script>

<style scoped>
.tab {
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  opacity: 0.5;
  text-transform: uppercase;
}

.tab:hover,
.tab-active {
  opacity: 1;
}
</style>
