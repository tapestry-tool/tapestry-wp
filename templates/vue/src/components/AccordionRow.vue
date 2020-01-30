<template>
  <div class="container">
    <div><slot name="trigger"></slot></div>
    <div v-if="visible" class="content"><slot name="content"></slot></div>
    <div v-if="visible"><slot name="footer"></slot></div>
  </div>
</template>

<script>
export default {
  name: "accordion-row",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  background: #643493;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
