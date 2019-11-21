<template>
  <div id="tyde">
    <tapestry />
    <tyde-module v-if="showModule" :node-id="moduleId" @done="showModule = false" />
    <tyde-menu
      v-if="isMenuOpen"
      :logs="logs"
      @audio-change="toggleAudio"
      @continue="continueTapestry"
      @return-to-map="returnToMap"
    />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeModule from "./tyde/TydeModule"
import TydeMenu from "./tyde/TydeMenu"
import { mapGetters, mapMutations } from "vuex"

const TYDE_BACKGROUND_AUDIO_SRC =
  "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" // test file

export default {
  name: "tyde",
  components: {
    Tapestry,
    TydeMenu,
    TydeModule,
  },
  data() {
    return {
      backgroundAudio: new Audio(TYDE_BACKGROUND_AUDIO_SRC),
      isMenuOpen: false,
      showModule: false,
      moduleId: null,
    }
  },
  mounted() {
    window.addEventListener("start-module", evt => {
      this.showModule = !this.showModule
      this.moduleId = evt.detail
    })
    window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        const { el } = this.lightbox
        if (el) {
          this.isMenuOpen ? el.play() : el.pause()
        }
        this.toggleMenu()
      }
    })
    this.backgroundAudio.loop = true
  },
  beforeDestroy() {
    window.removeEventListener("keydown")
  },
  computed: {
    ...mapGetters(["lightbox", "nodes"]),
    logs() {
      return this.nodes.filter(node => node.completed).map(node => {
        return {
          type: "content",
          title: node.title,
          imageURL: node.imageURL,
          description: node.description,
          isFavourite: node.isFavourite,
        }
      })
    }
  },
  methods: {
    ...mapMutations(["closeLightbox"]),
    continueTapestry() {
      const { el } = this.lightbox
      this.toggleMenu()
      if (el) {
        if (el.currentTime < el.duration) {
          el.play()
        }
      }
    },
    returnToMap() {
      this.closeLightbox()
      this.toggleMenu()
    },
    toggleAudio() {
      if (this.backgroundAudio.paused) {
        this.backgroundAudio.play()
      } else {
        this.backgroundAudio.pause()
      }
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
  },
}
</script>

<style>
:root {
  --tapestry-gray: #404040;
  --tapestry-light-gray: #787878;
  --tapestry-med-gray: #535353;
  --tapestry-light-blue: #1eade1;
}
</style>
