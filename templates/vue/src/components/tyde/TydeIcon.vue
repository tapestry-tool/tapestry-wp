<template>
  <img :src="url" :width="size" svg />
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
  mounted() {
    let selectedIcon = null

    if (this.selected) {
      switch (this.icon) {
        case "tyde":
          selectedIcon = tyde
          break
        case "profile":
          selectedIcon = profile
          break
        case "goals":
          selectedIcon = goals
          break
        case "cos":
          selectedIcon = cos
          break
      }
    } else {
      switch (this.icon) {
        case "tyde":
          selectedIcon = tydeUnselected
          break
        case "profile":
          selectedIcon = profileUnselected
          break
        case "goals":
          selectedIcon = goalsUnselected
          break
        case "cos":
          selectedIcon = cosUnselected
          break
      }
    }
    this.url = this.createUrl(selectedIcon)
  },
  methods: {
    createUrl(selected) {
      return `${data.vue_uri}/${selected.split("dist")[1]}`
    },
  },
}
</script>
