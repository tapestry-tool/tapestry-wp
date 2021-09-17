<template>
  <div class="locked-content">
    <div class="locked-header">
      <h2>
        <span class="fas fa-lock" title="This content is currently locked.">
          <i />
        </span>
      </h2>
    </div>
    <locked-text class="locked-body" :node="node" :condition-node="conditionNode" />
  </div>
</template>

<script>
import LockedText from "@/components/common/LockedText"

export default {
  components: {
    LockedText,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    conditionNode: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
}
</script>

<style lang="scss" scoped>
.locked-content {
  color: #555;
  text-align: center;
  font-weight: normal;
  background: #fff;
  border-radius: 1em;
  padding: 1em 0.5em 0.5em;
  margin: 0 auto 20px;
  max-width: 500px;

  .locked-header {
    opacity: 0.5;
  }
}
</style>
