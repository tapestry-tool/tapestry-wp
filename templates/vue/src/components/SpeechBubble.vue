<template>
  <div class="speech-bubble">
    <slot></slot>
    <div class="bubble-corner" :style="{ backgroundImage: bubbleImage }"></div>
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
  background: #fff;
  position: relative;
  border: 2px solid black;
  padding: 12px 16px;
  margin-bottom: 15px;
  border-radius: 1.2em;
  font-size: 1em;
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

  .bubble-corner {
    position: absolute;
    left: 10%;
    bottom: -31px;
    width: 46px;
    height: 32px;
    background-size: cover;
  }
}
</style>
