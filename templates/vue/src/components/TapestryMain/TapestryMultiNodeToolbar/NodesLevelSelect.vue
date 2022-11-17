<template>
  <div class="nodes-level-select">
    <button
      class="level-btn level-up"
      :class="{
        disabled: level === 1,
      }"
      @click="changeLevels(-1)"
    >
      <i class="fas fa-caret-up"></i>
    </button>
    <button class="circle-btn" @click="$emit('close')">
      <div class="level-circle">{{ level === null ? "--" : level }}</div>
    </button>
    <button class="level-btn level-down" @click="changeLevels(1)">
      <i class="fas fa-caret-down"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "nodes-level-select",
  props: {
    level: {
      type: Number,
      required: false,
      default: null,
    },
  },
  methods: {
    changeLevels(diff) {
      this.$emit("changeLevels", diff)
    },
  },
}
</script>

<style lang="scss" scoped>
.nodes-level-select {
  --radius: 22px;
  --level-btn-height: 42px;

  position: absolute;
  top: calc(-1 * (var(--level-btn-height) + 2px));
  left: -2px;
  width: 56px;
  background-color: #ededed;
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
  color: #59595b;
  transition: all 0.2s ease;
  border: 2px solid #f8f8f8;
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
    background: #d7d7d7;
  }

  &.disabled {
    color: #d7d7d7;
    cursor: pointer;
  }
}
</style>
