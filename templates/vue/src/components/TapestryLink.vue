<template>
  <line
    :x1="link.source[xCoord]"
    :x2="link.target[xCoord]"
    :y1="link.source[yCoord]"
    :y2="link.target[yCoord]"
    stroke="currentColor"
    stroke-width="6"
  ></line>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: "tapestry-link",
  props: {
    link: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["settings"]),
    autoLayout() {
      return this.settings.autolayout
    },
    xCoord() {
      return this.autoLayout ? "x" : "fx"
    },
    yCoord() {
      return this.autoLayout ? "y" : "fy"
    },
  },
}
</script>
