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
  width: 50%;
  margin-top: 35px;
}
</style>
