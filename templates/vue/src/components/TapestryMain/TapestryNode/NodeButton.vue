<template>
  <g
    :transform="`translate(${x}, ${y})`"
    :data-qa="dataQa"
    :aria-disabled="disabled"
    @click.stop="$emit('click')"
  >
    <circle
      ref="addButton"
      :r="radius * 0.2"
      :fill="fill"
      stroke="white"
      :stroke-width="radius * 0.02"
    ></circle>
    <tapestry-icon :icon="icon" svg :font-size="radius * 0.23"></tapestry-icon>
  </g>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  components: {
    TapestryIcon,
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    dataQa: {
      type: String,
      required: false,
      default: "node-button",
    },
    x: {
      type: Number,
      required: false,
      default: 0,
    },
    y: {
      type: Number,
      required: false,
      default: 0,
    },
    fill: {
      type: String,
      required: false,
      default: "#666",
    },
    icon: {
      type: String,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
  },
}
</script>
