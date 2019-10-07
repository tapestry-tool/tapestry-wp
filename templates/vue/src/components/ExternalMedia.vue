<template>
  <iframe
    id="external"
    frameborder="0"
    allowfullscreen="allowfullscreen"
    :src="node.typeData.mediaURL"
    :width="width"
    :height="height"
  >
  </iframe>
</template>

<script>
export default {
  name: 'external-media',
  props: ['node', 'width', 'height'],
}
</script>

<style scoped>

</style>
