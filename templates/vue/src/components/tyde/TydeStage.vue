<template>
  <div :style="nodeStyles">
    <button
      v-for="question in questions"
      :key="question.id"
      @click="openLightbox(question.id)"
    >
      {{ question.title }}
    </button>
    <button v-if="done" @click="$emit('next')"></button>
    <lightbox v-if="isLightboxOpen" :node-id="lightboxId" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import Lightbox from "../Lightbox"

export default {
  name: "tyde-stage",
  components: {
    Lightbox,
  },
  props: {
    nodeId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLightboxOpen: false,
      lightboxId: null,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    done() {
      return this.questions.every(question => question.completed)
    },
    node() {
      return this.getNode(this.nodeId)
    },
    nodeStyles() {
      return {
        backgroundImage: `url(${this.node.imageURL})`,
      }
    },
    questions() {
      const childrenIds = this.getDirectChildren(this.nodeId)
      return childrenIds.map(id => this.getNode(id))
    },
  },
  methods: {
    openLightbox(id) {
      this.isLightboxOpen = true
      this.lightboxId = id
    },
  },
}
</script>

<style scoped></style>
