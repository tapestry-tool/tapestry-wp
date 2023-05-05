<template>
  <span v-if="showTooltip">
    <i
      v-if="node.completed"
      :id="`node-${node.id}-checkmark`"
      class="fas fa-check-circle fa-xs"
      :class="{
        large: large,
      }"
    ></i>
    <b-tooltip
      :target="`node-${node.id}-checkmark`"
      placement="right"
      triggers="hover"
    >
      Already completed
    </b-tooltip>
  </span>
  <i
    v-else-if="node.completed"
    class="fas fa-check-circle fa-xs"
    :class="{
      large: large,
    }"
  ></i>
</template>

<script>
export default {
  name: "completed-icon",
  props: {
    node: {
      type: Object,
      required: true,
    },
    showTooltip: {
      type: Boolean,
      required: false,
      default: true,
    },
    large: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
i {
  font-size: 60%;
  color: #00bb00;

  &.large {
    font-size: 80%;
  }

  > ::before {
    display: block !important;
  }
}
</style>
