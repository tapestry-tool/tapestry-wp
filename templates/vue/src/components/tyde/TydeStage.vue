<template>
  <div class="module-container" :style="nodeStyles">
    <div class="button-container">
      <button
        v-for="(question, index) in questions"
        class="tyde-stage-button"
        :key="question.id"
        @click="openLightbox(question.id)"
      >
        <div class="tyde-stage-button-image-container" >
          <img class="tyde-stage-button-image" :src="getButtonImage(index)" :style="getImageStyles(index)" />
        </div>
        <p class="tyde-stage-button-text">{{ question.title }}</p>
      </button>
      <button class="tyde-button-next" v-if="done" @click="$emit('next')">Next</button>
    </div>
    <lightbox v-if="isLightboxOpen" :node-id="lightboxId" @close="closeLightbox" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import Lightbox from "../Lightbox"
import Helpers from "../../utils/Helpers"

import StageBackground from "../../assets/stage-bg.png"
import ButtonOne from "../../assets/tyde-button-1.png"
import ButtonTwo from "../../assets/tyde-button-2.png"
import ButtonThree from "../../assets/tyde-button-3.png"
import ButtonFour from "../../assets/tyde-button-4.png"

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
        backgroundImage: `url(${Helpers.getBackgroundUrl(StageBackground)})`,
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
    getButtonImage(index) {
      const images = [ButtonOne, ButtonTwo, ButtonThree, ButtonFour]
      return Helpers.getBackgroundUrl(images[index])
    },
    getImageStyles(index) {
      if (index === 0 || index === 3) {
        return { width: "70%" }
      }
      return {}
    }
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

.button-container {
  width: 70vw;
  height: 72vh;
  position: absolute;
  top: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'VT323', monospace;
}

.tyde-stage-button {
  margin: 0;
  padding: 20px 0;

  width: 164px;
  height: 196px;
  background: var(--tyde-green);
  border: 1px solid var(--tyde-border-green);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease-out;
  margin-right: 8px;
}

.tyde-stage-button:last-child {
  margin-right: 0;
}

.tyde-stage-button:hover {
  background: var(--tyde-border-green);
}

.tyde-stage-button:hover img {
  transform: translateY(-8px);
}

.tyde-stage-button-image {
  transition: transform 0.2s ease-out;
}

.tyde-stage-button-image-container {
  width: 80%;
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tyde-stage-button-text {
  padding: 0;
  margin: 0;
  font-family: inherit;
}

.tyde-button-next {
  background: none;
  margin: 0;
  padding: 0;

  font-family: inherit;
  font-size: 2.5em;
  position: absolute;
  bottom: 56px;
  right: 64px;
}

.tyde-button-next:hover {
  text-decoration: underline;
}
</style>
