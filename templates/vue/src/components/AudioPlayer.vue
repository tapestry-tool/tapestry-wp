<template>
  <audio controls="controls">
    Your browser does not support the
    <code>audio</code> element.
    <source v-bind:src="audioSrc" />
  </audio>
</template>

<script>

export default {
  name: "audio-player",
  props: {
    audioSrc: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
</style>