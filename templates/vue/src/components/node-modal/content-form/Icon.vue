<template>
  <div class="icon" :class="[`icon--${name}`, `icon--${size}`, { 'has-align-fix': fixAlign }]">
    <img :src="iconSource" :alt="`${name}`" />
  </div>
</template>

<script>
import bold from "../../../assets/icons/bold.svg"
import italic from "../../../assets/icons/italic.svg"
import underline from "../../../assets/icons/underline.svg"
import strike from "../../../assets/icons/strike.svg"
import paragraph from "../../../assets/icons/paragraph.svg"
import ul from "../../../assets/icons/ul.svg"
import ol from "../../../assets/icons/ol.svg"
import quote from "../../../assets/icons/quote.svg"
import code from "../../../assets/icons/code.svg"
import hr from "../../../assets/icons/hr.svg"
import undo from "../../../assets/icons/undo.svg"
import redo from "../../../assets/icons/redo.svg"


export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'normal',
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
      let lookup = new Map();
      let icons = [bold, italic, underline, strike, code, paragraph, ul, ol, quote, hr, undo, redo];
      let iconsStrings = ["bold", "italic", "underline", "strike", "code", "paragraph", "ul", "ol", "quote", "hr", "undo", "redo"];
      for (let i in icons) {
        lookup.set(iconsStrings[i], icons[i]);
      }
      let usedIcon = lookup.get(this.name);
      return `${wpData.vue_uri}/${usedIcon.split("dist")[1]}`
    },
  },
}
</script>

<style lang="scss" scoped>
.icon {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;

  &.has-align-fix {
    top: -.1rem;
  }
}

img {
  height: initial;
  max-width: initial;
  position: initial;
}
</style>
