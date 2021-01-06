<template>
  <div
    class="icon"
    :class="[`icon--${name}`, `icon--${size}`, { 'has-align-fix': fixAlign }]"
  >
    <img :src="iconSource" :alt="`${name}`" />
  </div>
</template>

<script>
import bold from "@/assets/icons/bold.svg"
import italic from "@/assets/icons/italic.svg"
import underline from "@/assets/icons/underline.svg"
import strike from "@/assets/icons/strike.svg"
import paragraph from "@/assets/icons/paragraph.svg"
import link from "@/assets/icons/link.svg"
import ul from "@/assets/icons/ul.svg"
import ol from "@/assets/icons/ol.svg"
import quote from "@/assets/icons/quote.svg"
import code from "@/assets/icons/code.svg"
import hr from "@/assets/icons/hr.svg"
import undo from "@/assets/icons/undo.svg"
import redo from "@/assets/icons/redo.svg"
import remove from "@/assets/icons/remove.svg"
import { data } from "@/services/wp"

export default {
  props: {
    name: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "normal",
    },
    modifier: {
      type: Object,
      default: null,
    },
    fixAlign: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconSource() {
      const lookup = {
        bold,
        italic,
        underline,
        strike,
        code,
        link,
        paragraph,
        ul,
        ol,
        quote,
        hr,
        undo,
        redo,
        remove,
      }
      let usedIcon = lookup[this.name]
      return `${data.vue_uri}/${usedIcon.split("dist")[1]}`
    },
  },
}
</script>

<style lang="scss" scoped>
.icon {
  width: 100%;
  &.has-align-fix {
    top: -0.1rem;
  }
}

img {
  height: initial;
  max-width: initial;
  position: initial;
}
</style>
