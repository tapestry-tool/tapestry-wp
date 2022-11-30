<template>
  <div class="node-level-select">
    <button
      class="level-btn level-up"
      :class="{
        disabled: node.level === 1,
      }"
      @click="changeLevel(-1)"
    >
      <i class="fas fa-caret-up"></i>
    </button>
    <button class="circle-btn" @click="$emit('close')">
      <div class="level-circle">{{ node.level }}</div>
    </button>
    <button class="level-btn level-down" @click="changeLevel(1)">
      <i class="fas fa-caret-down"></i>
    </button>
  </div>
</template>

<script>
import { mapActions } from "vuex"
export default {
  name: "node-level-select",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions(["updateNode"]),
    changeLevel(diff) {
      if (this.node.level + diff < 1) {
        return
      }
      this.updateNode({
        id: this.node.id,
        newNode: {
          level: this.node.level + diff,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.node-level-select {
  --radius: 22px;
  --level-btn-height: 42px;

  position: absolute;
  top: calc(-1 * (var(--level-btn-height) + 2px));
  left: -2px;
  width: 56px;
  background-color: var(--bg-color-secondary);
  border-radius: var(--radius);
}

.level-up {
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
  border-bottom: none;
}

.level-down {
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  border-top: none;
}

.level-circle {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: var(--tapestry-light-blue);
  color: #ffffff;
  font-size: 0.8rem;
  line-height: 1.5rem;
  margin-top: -2px;
}

button {
  padding: 0;
  background: none;
  font-size: 1.2em;
  color: var(--text-color-primary);
  transition: all 0.2s ease;
  border: 2px solid var(--border-color);
}

.circle-btn {
  height: 58px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.level-btn {
  height: var(--level-btn-height);
  width: 100%;

  &:not(.disabled):hover {
    background: var(--bg-color-primary);
  }

  &.disabled {
    color: var(--border-color);
    cursor: default;
  }
}
</style>
