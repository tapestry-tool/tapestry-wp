<template>
  <article v-html="node.typeData.textContent" />
</template>

<script>
export default {
  name: "post-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>
