<template>
  <audio controls v-bind:src="audioSrc"></audio>
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
  margin-top: 35px;
}
</style>