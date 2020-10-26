<template>
  <g :transform="`translate(${x}, ${y})`">
    <circle
      ref="addButton"
      r="27"
      fill="#666"
      stroke="white"
      stroke-width="3"
      :aria-disabled="disabled"
      :data-qa="dataQa"
      @click.stop="$emit('click')"
    ></circle>
    <slot></slot>
  </g>
</template>

<script>
export default {
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
  },
}
</script>
