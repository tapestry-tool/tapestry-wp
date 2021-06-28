<template>
  <div class="wrapper" data-qa="play-screen" :style="style">
    <button class="button-play" @click="$emit('play')">
      <i class="fas fa-play-circle fa-4x"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "play-screen",
  props: {
    hideVideo: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      backgroundRGB: "44, 44, 44",
    }
  },
  computed: {
    style() {
      if (this.hideVideo) {
        return (
          "background: " +
          "linear-gradient(" +
          "0deg, " +
          "rgb(" +
          this.backgroundRGB +
          ")," +
          "rgb(" +
          this.backgroundRGB +
          ")," +
          "rgba(" +
          this.backgroundRGB +
          ", 0.3)," +
          "transparent" +
          ");"
        )
      }
      // to account for player controls
      return "height: calc(100% - 80px);"
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
}

.button-play {
  margin: auto;
  padding: 3px 2px 2px 2.5px;
  box-shadow: 0 0 7vh 0 #000;
  color: #666;
  background: #fff;
  border-radius: 100%;
  font-size: 3.5vh;
}
</style>
