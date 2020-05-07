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
export default {
  name: "tapestry-link",
  props: {
    autoLayout: {
      type: Boolean,
      required: true,
    },
    link: {
      type: Object,
      required: true,
    },
  },
  computed: {
    xCoord() {
      return this.autoLayout ? "x" : "fx"
    },
    yCoord() {
      return this.autoLayout ? "y" : "fy"
    },
  },
}
</script>
