<template>
  <div>
    <input type="image" id="tyde-backpack-icon" :src="backpackUrl" @click="toggleMenu"/>
    <tyde-menu
      v-if="isMenuOpen"
      @audio-change="toggleAudio"
      @continue="continueTapestry"
      @return-to-map="returnToMap"
    />
  </div>
</template>

<script>
import TydeMenu from "./TydeMenu"
import BackpackIcon from "@/assets/backpack.svg"
import { mapGetters, mapMutations } from "vuex"

const TYDE_BACKGROUND_AUDIO_SRC =
  "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" // test file

export default {
  name: "tyde-backpack",
  components: {
    TydeMenu,
  },
  data() {
    return {
      backgroundAudio: new Audio(TYDE_BACKGROUND_AUDIO_SRC),
      isMenuOpen: false,
      escMenuOpenListener: null,
    }
  },
  mounted() {
    this.escMenuOpenListener = window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        const { el } = this.lightbox
        if (el) {
          if (this.isMenuOpen && el.currentTime < el.duration) {
            el.play()
          } else {
            el.pause()
          }
        }
        this.toggleMenu()
      }
    })
    this.backgroundAudio.loop = true
  },
  computed: {
    ...mapGetters(["lightbox"]),
    backpackUrl() {
      return `${wpData.vue_uri}/${BackpackIcon.split("dist")[1]}`
    },
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
  beforeDestroy() {
    window.removeEventListener(this.escMenuOpenListener)
  },
}
</script>


<style lang="scss" scoped>
#tyde-backpack-icon {
  position: absolute;
  top: 0px;
  right: 5%;
  max-width: 140px;
  outline: none;
}
</style>
