<template>
  <div>
    <div><slot name="trigger"></slot></div>
    <div v-if="visible"><slot></slot></div>
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
