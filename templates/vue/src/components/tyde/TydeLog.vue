<template>
  <li class="log">
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: 'tyde-log',
  props: {
    log: {
      type: Object,
      required: true,
    },
  }
}
</script>

<style scoped>
.log {
  background: var(--tapestry-med-gray);
  border: 1px solid var(--tapestry-light-gray);
  margin: 0;
  margin-bottom: 8px;
  min-height: 160px;
  padding: 8px 24px;
  width: 100%;
}
</style>
