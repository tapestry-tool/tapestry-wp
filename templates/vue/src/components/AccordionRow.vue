<template>
  <div>
    <div><slot name="trigger"></slot></div>
    <div v-if="visible" class="content"><slot></slot></div>
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
.content {
  padding-bottom: 16px;
}
</style>
