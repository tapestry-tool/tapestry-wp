<template>
  <span>
    <i
      v-if="node.completed"
      :id="`node-${node.id}-checkmark`"
      class="fas fa-check-circle fa-xs"
    ></i>
    <b-tooltip
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
  },
}
</script>

<style lang="scss" scoped>
i {
  font-size: 0.5em;
  color: #00bb00;

  > ::before {
    display: block !important;
  }
}
</style>
