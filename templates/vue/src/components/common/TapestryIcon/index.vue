<template>
  <text
    v-if="svg"
    :class="svgClass"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    font-weight="900"
    :font-size="fontSize"
    :x="adjustX"
    :y="adjustY"
  >
    {{ textContent[icon] }}
  </text>
  <i v-else-if="isPlainText" class="icon-plaintext">{{ textContent[icon] }}</i>
  <drag-drop-icon
    v-else-if="icon === 'dragDrop'"
    class="icon-dragdrop"
    style="display:inline;"
    width="30"
    height="30"
  />
  <i v-else :class="iconClass"></i>
</template>

<script>
const textContent = {
  lock: "\uf023",
  tasks: "\uf0ae",
  checklist: "\uf0ae",
  "window-maximize": "\uf2d0",
  bars: "\uf0c9",
  post: "\uf411",
  exclamation: "\uf12a",
  microphone: "\uf130",
  font: "\uf031",
  pen: "\uf304",
  plus: "\uf067",
  play: "\uf04b",
  text: "\uf11c",
  answer: "\uf02e",
  "comment-dots": "\uf4ad",
}

const aliases = {
  audio: "microphone",
  checklist: "tasks",
  text: "keyboard",
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
 * the `textContent` object. If it's not there, the icon must first be added as
 * a key that maps to its unicode value.
 *
 * One way of getting the unicode value is to open the FontAwesome css file:
 *  - https://use.fontawesome.com/releases/v5.5.0/css/all.css
 * Then doing a "Cmd + F" on the icon name. The unicode is the value of the
 * "content" attribute of that icon.
 */
import DragDropIcon from "./DragDropIcon.vue"

export default {
  name: "tapestry-icon",
  components: {
    DragDropIcon,
  },
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
    svgClass() {
      switch (this.icon) {
        case "post":
          return "brand"
      }
      return "free"
    },
    iconClass() {
      return `fas fa-${aliases[this.icon] || this.icon} icon-fa`
    },
    isPlainText() {
      return false
    },
    textContent() {
      return textContent
    },
    adjustX() {
      return this.icon === "play" ? 2 : 0
    },
    adjustY() {
      return this.icon === "post" ? 4 : 2
    },
    fontSize() {
      return this.icon === "post" ? 46 : 32
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

.icon-drag-drop svg {
  fill: #000;
}
</style>
