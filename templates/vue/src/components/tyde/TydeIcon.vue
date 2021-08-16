<template>
  <div>
    <img :id="icon" :src="url" :width="size" svg />
    <b-tooltip
      v-if="windowWidth > 700"
      :target="icon"
      triggers="hover"
      :placement="placement"
      custom-class="nav-item-tooltip text-capitalize"
    >
      {{ title }}
    </b-tooltip>
  </div>
</template>

<script>
import { data } from "@/services/wp"
import tyde from "@/assets/icons/tyde/tyde.svg"
import tydeUnselected from "@/assets/icons/tyde/tyde-unselected.svg"
import goals from "@/assets/icons/tyde/goals.svg"
import goalsUnselected from "@/assets/icons/tyde/goals-unselected.svg"
import profile from "@/assets/icons/tyde/profile.svg"
import profileUnselected from "@/assets/icons/tyde/profile-unselected.svg"
import cos from "@/assets/icons/tyde/cos.svg"
import cosUnselected from "@/assets/icons/tyde/cos-unselected.svg"

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
    placement: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      url: "",
      windowWidth: window.innerWidth,
    }
  },
  computed: {
    title() {
      let title = " "
      switch (this.icon) {
        case "default":
          title = "Learning Program"
          break
        case "profile":
          title = "Profile"
          break
        case "goals":
          title = "Goals"
          break
        case "cos":
          title = "Circle of Support"
          break
      }

      return title
    },
  },
  watch: {
    selected() {
      this.selectIcon()
    },
  },
  mounted() {
    this.selectIcon()

    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth
    })
  },
  methods: {
    createUrl(selected) {
      return `${data.vue_uri}/${selected.split("dist")[1]}`
    },
    selectIcon() {
      let selectedIcon = null

      switch (this.icon) {
        case "default":
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

<style>
.nav-item-tooltip .tooltip-inner {
  background: transparent !important;
  color: black !important;
  font-family: "Source Sans Pro", sans-serif !important;
  font-size: 1rem;
  font-weight: 500;
  max-width: 100px;
  padding: 0.25rem 0 !important;
  line-height: 100% !important;
}
.nav-item-tooltip > .arrow {
  display: none !important;
}
</style>
