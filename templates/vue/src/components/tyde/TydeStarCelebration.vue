<template>
  <div class="star-celebration">
    <tapestry-modal
      :allow-close="true"
      :content-container-style="celebrationStyles"
      @close="$emit('close')"
    ></tapestry-modal>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import TapestryModal from "../TapestryModal"
import UnlockImage from "@/assets/tyde-unlock.gif"
import UnlockSound from "@/assets/tyde-unlock-sound.wav"

export default {
  name: "tyde-star-celebration",
  components: {
    TapestryModal,
  },
  computed: {
    celebrationStyles() {
      return {
        backgroundColor: "white",
        backgroundImage: `url(${Helpers.getImagePath(UnlockImage)})`,
        backgroundOrigin: "content-box",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        padding: "32px 32px",
        top: "150px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "400px",
        height: "400px",
      }
    },
  },
  mounted() {
    let audio = new Audio(Helpers.getImagePath(UnlockSound))
    audio.play()
  },
}
</script>

<style lang="scss" scoped></style>
