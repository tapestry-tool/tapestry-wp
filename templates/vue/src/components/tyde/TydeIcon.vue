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
      default: 32,
    },
  },
  data() {
    return {
      url: "",
    }
  },
  mounted() {
    let selected = null
    switch (this.icon) {
      case "tyde":
        selected = tyde
        break
      case "tyde-unselected":
        selected = tydeUnselected
        break
      case "goals":
        selected = goals
        break
      case "goals-unselected":
        selected = goalsUnselected
        break
      case "profile":
        selected = profile
        break
      case "profile-unselected":
        selected = profileUnselected
        break
      case "cos":
        selected = cos
        break
      case "cos-unselected":
        selected = cosUnselected
        break
      default:
        selected = tyde
        break
    }
    this.url = this.createUrl(selected)
  },
  methods: {
    createUrl(selected) {
      return `${data.vue_uri}/${selected.split("dist")[1]}`
    },
  },
}
</script>
