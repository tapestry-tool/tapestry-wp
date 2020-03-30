<template>
  <div>
    <input
      id="tyde-spaceship-icon"
      type="image"
      :src="spaceshipIconUrl"
      @click="toggleMenu"
    />
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
import SpaceshipIcon from "@/assets/spaceship.png"
import { mapState } from "vuex"
import Helpers from "../../utils/Helpers"

const TYDE_BACKGROUND_AUDIO_SRC =
  "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" // test file

export default {
  name: "tyde-spaceship",
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
  async mounted() {
    this.escMenuOpenListener = window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        if (this.lightbox) {
          if (
            this.isMenuOpen &&
            this.lightbox.currentTime < this.lightbox.duration
          ) {
            this.lightbox.play()
          } else {
            this.lightbox.pause()
          }
        }
        this.toggleMenu()
      }
    })
    this.backgroundAudio.loop = true
  },
  computed: {
    ...mapState(["lightbox"]),
    spaceshipIconUrl() {
      return Helpers.getImagePath(SpaceshipIcon)
    }
  },
  beforeDestroy() {
    window.removeEventListener(this.escMenuOpenListener)
  },
  methods: {
    continueTapestry() {
      this.toggleMenu()
      if (this.lightbox) {
        if (this.lightbox.currentTime < this.lightbox.duration) {
          this.lightbox.play()
        }
      }
    },
    returnToMap() {
      this.$router.push("/")
      this.toggleMenu()
      this.$emit("return-to-map")
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

<style lang="scss" scoped>
#tyde-spaceship-icon {
  position: absolute;
  top: 0px;
  right: 5%;
  max-width: 140px;
  outline: none;
}
</style>
