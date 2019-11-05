<template>
  <div :style="nodeStyles">
    <button
      v-for="question in questions"
      :key="question.id"
      @click="openLightbox(question.id)"
    >
      {{ question.title }}
    </button>
  </div>
</template>

<script>
export default {
  name: "tyde-stage",
  props: {
    nodeId: {
      type: String,
      required: true,
    },
  },
  computed: {
    done() {
      return this.questions.every(question => question.completed)
    },
    node() {
      // TODO: Change this to 'getNode' from store
      return {
        imageURL: "",
      }
    },
    nodeStyles() {
      return {
        backgroundImage: `url(${this.node.imageURL})`,
      }
    },
    questions() {
      // TODO: Change this to 'getChildren' from store
      return []
    },
  },
  methods: {
    next() {
      this.activeStageIndex++
    },
    openLightbox(id) {
      // TODO: Move lightbox code to store, make this method commit an event to open lightbox
      return id // stub
    },
  },
}
</script>

<style scoped></style>
