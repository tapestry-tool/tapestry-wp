<template>
  <div>
    <img :id="'tyde-icon-' + icon" :src="url" :width="size" svg />
    <b-tooltip
      :target="'tyde-icon-' + icon"
      triggers="hover"
      :placement="!inlineTooltips ? 'bottom' : isLast ? 'left' : 'right'"
      :custom-class="inlineTooltips ? 'inline-tooltip' : ''"
      no-fade
      :delay="0"
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
    isLast: {
      type: Boolean,
      required: false,
      default: false,
    },
    inlineTooltips: {
      type: Boolean,
      required: false,
      default: true,
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
          selectedIcon = this.selected ? tyde : tydeUnselected
          break
        case "profile":
          selectedIcon = this.selected ? profile : profileUnselected
          break
        case "goals":
          selectedIcon = this.selected ? goals : goalsUnselected
          break
        case "cos":
          selectedIcon = this.selected ? cos : cosUnselected
          break
      }

      this.url = this.createUrl(selectedIcon)
    },
  },
}
</script>

<style lang="scss">
.inline-tooltip {
  .tooltip-inner {
    background: transparent !important;
    color: black !important;
    font-family: "Source Sans Pro", sans-serif !important;
    font-size: 1rem;
    font-weight: 500;
    max-width: 100px;
    padding: 0.25rem 0 0.25rem 0.5rem !important;
    line-height: 100% !important;
  }
  > .arrow {
    display: none !important;
  }
}
</style>
