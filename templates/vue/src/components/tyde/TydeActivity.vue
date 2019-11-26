<template>
  <div>
    <p>You answered:</p>
    <div>
      <audio-player v-if="log.audioSrc" :audio-src="log.audioSrc"></audio-player>
      <p v-else-if="log.text">{{ log.text }}</p>
      <ul v-else-if="log.checklist">
        <li v-for="answer in log.checklist" :key="answer">{{ answer }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import AudioPlayer from "@/components/AudioPlayer"

export default {
  name: "tyde-activity",
  components: {
    AudioPlayer,
  },
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
}
</script>
