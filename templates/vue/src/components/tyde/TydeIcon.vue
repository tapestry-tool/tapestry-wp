<template>
  <i v-if="icon !== 'text'" :class="`fas fa-${iconSrc} icon-fa`"></i>
  <img v-else :src="iconSrc" />
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import Helpers from "@/utils/Helpers"

export default {
  name: 'tyde-icon',
  props: {
    icon: {
      type: String,
      required: true,
      validator: prop => ["audio", "checklist", "text"].includes(prop)
    }
  },
  computed: {
    iconSrc() {
      const icons = {
        audio: "microphone",
        checklist: "tasks",
        text: Helpers.getImagePath(TextIcon)
      }
      return icons[this.icon]
    }
  }
}
</script>
