<template>
  <i v-if="icon !== 'text'" :class="iconSrc"></i>
  <img v-else :src="iconSrc" />
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import Helpers from "@/utils/Helpers"

export default {
  name: "tapestry-icon",
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconSrc() {
      if (this.icon === "post") {
        return "fab fa-wordpress-simple"
      }
      if (this.icon === "text") {
        return Helpers.getImagePath(TextIcon)
      }
      const icons = {
        audio: "microphone",
        checklist: "tasks",
      }
      return `fas fa-${icons[this.icon] || this.icon} icon-fa`
    },
  },
}
</script>
