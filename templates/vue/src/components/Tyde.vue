<template>
  <div id="tyde">
    <tapestry />
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
import TydeMenu from "./tyde/TydeMenu"

const TYDE_BACKGROUND_AUDIO_SRC =
  "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" // test file

export default {
  name: "tyde",
  components: {
    Tapestry,
    TydeMenu,
  },
  data() {
    return {
      backgroundAudio: new Audio(TYDE_BACKGROUND_AUDIO_SRC),
      isMenuOpen: false,
      lightbox: {},
      logs: [
        {
          name: "Log 1",
          type: "activity",
          isFavourite: false,
        },
        {
          name: "Log 2",
          type: "content",
          isFavourite: true,
        },
        {
          name: "Log 3",
          type: "activity",
          isFavourite: true,
        },
      ],
    }
  },
  mounted() {
    window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        const { el } = this.lightbox
        if (el) {
          this.isMenuOpen ? el.play() : el.pause()
        }
        this.toggleMenu()
      }
    })
    window.addEventListener("tyde-open-lightbox-video", this.saveLightbox)
    window.addEventListener("tyde-close-lightbox", this.clearLightbox)
    this.backgroundAudio.loop = true
  },
  beforeDestroy() {
    window.removeEventListener("keydown")
    window.removeEventListener("tyde-open-lightbox")
    window.removeEventListener("tyde-close-lightbox")
  },
  methods: {
    continueTapestry() {
      const { el } = this.lightbox
      this.toggleMenu()
      if (el) {
        el.play()
      }
    },
    clearLightbox() {
      this.lightbox = {}
      console.log("Clearing", this.lightbox)
    },
    returnToMap() {
      const { id, type } = this.lightbox
      if (id && type) {
        thisTapestryTool.closeLightbox(id, type)
      }
      this.clearLightbox()
      this.toggleMenu()
    },
    saveLightbox(event) {
      this.lightbox = event.detail
      console.log("Saving", this.lightbox)
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
