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

/**
 * The `<tapestry-icon>` component is a wrapper around FontAwesome (FA) that
 * allows use of FA icons within SVGs.
 *
 * It accepts an `icon` string and an optional `svg` flag. If the `svg`
 * flag is `true`, this component assumes it's going to be embedded within
 * an `svg` and returns the appropriate tag.
 *
 * If the `svg` flag is `false`, the `icon` string can be any valid FA free
 * icon. See the following link for all available icons:
 *  - https://fontawesome.com/icons?d=gallery&m=free
 *
 * If the `svg` flag is `true`, the `icon` string must be one of the keys in
 * the `unicodes` object. If it's not there, the icon must first be added as
 * a key that maps to its unicode value.
 *
 * One way of getting the unicode value is to open the FontAwesome css file:
 *  - https://use.fontawesome.com/releases/v5.5.0/css/all.css
 * Then doing a "Cmd + F" on the icon name. The unicode is the value of the
 * "content" attribute of that icon.
 */
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
