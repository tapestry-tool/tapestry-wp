<template>
  <img v-if="isImage" :src="imageSource" />
  <text
    v-else-if="svg"
    :class="icon === 'post' ? 'brand' : 'free'"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    font-weight="900"
    font-size="24"
  >
    {{ unicodes[icon] }}
  </text>
  <i v-else :class="iconClass"></i>
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import Helpers from "@/utils/Helpers"

const images = {
  text: TextIcon,
}

const unicodes = {
  lock: "\uf023",
  tasks: "\uf0ae",
  checklist: "\uf0ae",
  "window-maximize": "\uf2d0",
  bars: "\uf0c9",
  post: "\uf411",
  exclamation: "\uf12a",
  microphone: "\uf130",
  pen: "\uf304",
  plus: "\uf067",
}

const aliases = {
  audio: "microphone",
  checklist: "tasks",
}

export default {
  name: "tapestry-icon",
  props: {
    icon: {
      type: String,
      required: true,
    },
    svg: {
      type: Boolean,
      required: false,
      default: false,
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
      return `fas fa-${aliases[this.icon] || this.icon} icon-fa`
    },
    imageSource() {
      return Helpers.getImagePath(images[this.icon])
    },
    unicodes() {
      return unicodes
    },
  },
}
</script>

<style lang="scss" scoped>
.brand {
  font-family: "Font Awesome 5 Brands";
}

.free {
  font-family: "Font Awesome 5 Free";
}
</style>
