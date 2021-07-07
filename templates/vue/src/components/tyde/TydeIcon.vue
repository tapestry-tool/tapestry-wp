<template>
  <div>
    <img :src="url" :width="size" svg />
  </div>
</template>

<script>
import { data } from "@/services/wp"
import tyde from "@/assets/icons/tyde.svg"
import tydeUnselected from "@/assets/icons/tyde-unselected.svg"
import goals from "@/assets/icons/goals.svg"
import goalsUnselected from "@/assets/icons/goals-unselected.svg"
import profile from "@/assets/icons/profile.svg"
import profileUnselected from "@/assets/icons/profile-unselected.svg"
import cos from "@/assets/icons/cos.svg"
import cosUnselected from "@/assets/icons/cos-unselected.svg"

export default {
  name: "tyde-icon",
  props: {
    icon: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number],
      required: false,
      default: 35,
    },
    selected: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      url: "",
    }
  },
  watch: {
    selected() {
      this.selectIcon()
    },
  },
  mounted() {
    this.selectIcon()
  },
  methods: {
    createUrl(selected) {
      return `${data.vue_uri}/${selected.split("dist")[1]}`
    },
    selectIcon() {
      let selectedIcon = null

      switch (this.icon) {
        case "tyde":
          if (this.selected) selectedIcon = tyde
          else selectedIcon = tydeUnselected
          break
        case "profile":
          if (this.selected) selectedIcon = profile
          else selectedIcon = profileUnselected
          break
        case "goals":
          if (this.selected) selectedIcon = goals
          else selectedIcon = goalsUnselected
          break
        case "cos":
          if (this.selected) selectedIcon = cos
          else selectedIcon = cosUnselected
          break
      }

      this.url = this.createUrl(selectedIcon)
    },
  },
}
</script>
