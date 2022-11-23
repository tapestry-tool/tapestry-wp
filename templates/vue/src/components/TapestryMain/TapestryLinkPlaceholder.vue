<template>
  <line
    :x1="node.coordinates.x * scale"
    :x2="frozen ? freezeCoordinates.x : coordinates.x"
    :y1="node.coordinates.y * scale"
    :y2="frozen ? freezeCoordinates.y : coordinates.y"
    stroke="currentColor"
    :stroke-width="strokeWidth"
  ></line>
</template>

<script>
import Helpers from "@/utils/Helpers"
import { scaleConstants } from "@/utils/constants"

export default {
  props: {
    scale: {
      type: Number,
      required: true,
    },
    node: {
      type: Object,
      required: true,
    },
    coordinates: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      frozen: false,
      freezeCoordinates: null,
    }
  },
  computed: {
    strokeWidth() {
      return (
        Helpers.getNodeRadius(this.node.level, this.scale) *
        scaleConstants.lineWidthRatio
      )
    },
  },
  methods: {
    freeze() {
      this.freezeCoordinates = { x: this.coordinates.x, y: this.coordinates.y }
      this.frozen = true
    },
    unfreeze() {
      this.freezeCoordinates = null
      this.frozen = false
    },
  },
}
</script>
