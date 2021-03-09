<template>
  <button @click="transition">
    <span
      :class="['circle', { active: state === states.All || state === states.One }]"
    />
    <span
      :class="['circle', { active: state === states.All || state === states.Two }]"
    />
    <span
      :class="['circle', { active: state === states.All || state === states.Three }]"
    />
  </button>
</template>

<script>
const States = {
  All: 3,
  One: 0,
  Two: 1,
  Three: 2,
}

export default {
  data() {
    return {
      state: States.All,
    }
  },
  computed: {
    states() {
      return States
    },
  },
  watch: {
    state(index) {
      this.$emit("change", index)
    },
  },
  methods: {
    transition() {
      switch (this.state) {
        case States.All:
          this.state = States.Three
          break
        case States.One:
          this.state = States.All
          break
        case States.Two:
          this.state = States.One
          break
        case States.Three:
          this.state = States.Two
          break
        default:
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  margin: 0;
  padding: 0;
  background: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.circle {
  border: var(--border-width, 2px) solid
    var(--border-color, var(--cos-color-tertiary));
  width: calc(var(--radius) * 2);
  height: calc(var(--radius) * 2);
  border-radius: 50%;
  position: absolute;

  &.active {
    --border-width: 4px;
    --border-color: var(--cos-color-secondary);
  }

  &:first-child {
    --radius: 20px;
  }

  &:nth-child(2) {
    --radius: 40px;
  }

  &:nth-child(3) {
    --radius: 60px;
  }
}
</style>
