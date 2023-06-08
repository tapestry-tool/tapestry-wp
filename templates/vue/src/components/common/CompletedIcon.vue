<template>
  <span v-if="node.completed" class="completed-icon">
    <i
      class="far fa-check-circle fa-xs"
      :class="{
        large: large,
      }"
    ></i>
    <i
      :id="`node-${node.id}-checkmark`"
      class="fas fa-check-circle fa-xs"
      :class="{
        large: large,
      }"
    ></i>
    <b-tooltip
      v-if="showTooltip"
      :target="`node-${node.id}-checkmark`"
      placement="right"
      triggers="hover"
    >
      Already completed
    </b-tooltip>
  </span>
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
.completed-icon {
  position: relative;
  display: inline-block;
}

i {
  font-size: 60%;
  color: #eee;
  position: absolute;
  bottom: -2px;

  &.far {
    color: #5d656c;
  }

  &.large {
    font-size: 80%;
  }

  > ::before {
    display: block !important;
  }
}
</style>
