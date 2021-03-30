<template>
  <div>
    <p>You answered:</p>
    <div>
      <audio v-if="log.audioSrc" :src="log.audioSrc"></audio>
      <div v-else-if="log.text" v-html="log.text"></div>
      <ul v-else-if="log.checklist">
        <li v-for="answer in log.checklist" :key="answer">{{ answer }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "tyde-activity",
  props: {
    log: {
      type: Object,
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
