<template>
  <div class="bubble">
    <slot></slot>
    <div class="bubble-pointer" :style="{ backgroundImage: bubbleImage }"></div>
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

<style scoped>
.bubble {
  position: relative;
  border: 2px solid black;
  padding: 12px 16px;
  border-radius: 1em;
}

.bubble-pointer {
  position: absolute;
  left: 10%;
  bottom: -31px;
  width: 46px;
  height: 32px;
  background-size: cover;
}

.bubble:after {
  content: "";
  position: absolute;
  left: 10%;
  bottom: -2px;
  width: 15px;
  height: 2px;
  background: black;
}
</style>
