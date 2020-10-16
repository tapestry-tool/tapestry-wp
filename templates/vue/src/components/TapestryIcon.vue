<template>
  <img v-if="isImage" :src="imageSource" />
  <i v-else :class="iconClass"></i>
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import Helpers from "@/utils/Helpers"

const images = {
  text: TextIcon,
}

export default {
  name: "tapestry-icon",
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  computed: {
    isImage() {
      return images.hasOwnProperty(this.icon)
    },
    iconClass() {
      if (this.icon === "post") {
        return "fab fa-wordpress-simple"
      }
      const icons = {
        audio: "microphone",
        checklist: "tasks",
      }
      return `fas fa-${icons[this.icon] || this.icon} icon-fa`
    },
    imageSource() {
      return Helpers.getImagePath(images[this.icon])
    },
  },
}
</script>
