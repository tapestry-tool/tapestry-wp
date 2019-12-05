<template>
  <audio controls :src="audioSrc"></audio>
</template>

<script>
export default {
  name: "audio-player",
  props: {
    audioSrc: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
audio {
  width: calc(100% - 30px);
}
</style>
