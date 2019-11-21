<template>
  <div class="module-container" :style="nodeStyles">
    <div class="stage-content">
      <h1 class="tyde-stage-title">{{ node.title }}</h1>
      <section class="button-container">
        <button
          v-for="question in questions"
          :key="question.id"
          class="tyde-stage-button"
          @click="openLightbox(question.id)"
        >
          <div class="tyde-stage-button-image-container">
            <img class="tyde-stage-button-image" :src="question.imageURL" />
          </div>
          <p class="tyde-stage-button-text">{{ question.title }}</p>
        </button>
      </section>
      <footer class="tyde-stage-footer">
        <button v-if="done" class="tyde-button-next" @click="$emit('next')">
          Next
        </button>
      </footer>
    </div>
    <lightbox v-if="isLightboxOpen" :node-id="lightboxId" @close="closeLightbox" />
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
      type: [String, Number],
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
    closeLightbox() {
      this.isLightboxOpen = false
      this.lightboxId = null
    },
    getImageStyles(index) {
      if (index === 0 || index === 3) {
        return { width: "70%" }
      }
      return {}
    },
  },
}
</script>

<style>
:root {
  --tyde-green: #205a27;
  --tyde-border-green: #39b54a;
}
</style>

<style scoped>
.module-container {
  background-size: cover;
  height: 100%;
  width: 100%;
}

.stage-content {
  width: 70vw;
  height: 72vh;
  position: absolute;
  top: 32px;
  right: 32px;
  font-family: "VT323", monospace;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 64px;
  color: var(--tyde-border-green);
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.tyde-stage-button {
  margin: 0;
  background: none;
  color: inherit;
}

.tyde-stage-button:hover .tyde-stage-button-text {
  transform: translateY(-8px);
}

.tyde-stage-button-image {
  width: 90%;
  height: auto;
}

.tyde-stage-button-image-container {
  width: 198px;
  height: 184px;
}

.tyde-stage-button-text {
  padding: 0;
  margin: 0;
  font-family: inherit;
  color: inherit;
  font-size: 32px;
  transition: transform 0.2s ease-out;
}

.tyde-button-next {
  background: none;
  margin: 0;
  padding: 0;

  font-family: inherit;
  font-size: 2.5em;
  color: inherit;
}

.tyde-stage-footer {
  display: flex;
  justify-content: flex-end;
}

.tyde-button-next:hover {
  text-decoration: underline;
}

.tyde-stage-title {
  font-family: inherit;
  font-size: 64px;
}

.tyde-stage-title::before {
  display: none;
}
</style>
