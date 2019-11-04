<template>
  <iframe
    id="external"
    frameborder="0"
    allowfullscreen="allowfullscreen"
    :src="node.typeData.mediaURL"
    :width="width"
    :height="height"
  ></iframe>
</template>

<script>
export default {
  name: "external-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
}
</script>

<style scoped></style>
