<template>
  <img v-if="icon === 'text'" :src="iconTextSrc" />
  <i v-else :class="iconClass"></i>
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
    iconTextSrc() {
      return Helpers.getImagePath(TextIcon)
    },
  },
}
</script>
