<template>
  <div class="speech-bubble">
    <slot></slot>
    <div :style="{ backgroundImage: bubbleImage }"></div>
  </div>
</template>

<script>
import SpeechBubble from "../assets/speech-bubble-end.png"

export default {
  name: "speech-bubble",
  computed: {
    bubbleImage() {
      return `url(${wpData.vue_uri}/${SpeechBubble.split("dist")[1]})`
    },
  },
}
</script>

<style lang="scss" scoped>
.speech-bubble {
  position: relative;
  border: 2px solid black;
  padding: 12px 16px;
  border-radius: 1em;
  font-size: 28px;
  font-style: italic;
  line-height: 1.2;

  &:after {
    content: "";
    position: absolute;
    left: 10%;
    bottom: -2px;
    width: 15px;
    height: 2px;
    background: black;
  }

  > div {
    position: absolute;
    left: 10%;
    bottom: -31px;
    width: 46px;
    height: 32px;
    background-size: cover;
  }
}
</style>
