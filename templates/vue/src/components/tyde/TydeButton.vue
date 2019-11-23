<template>
  <button class="tyde-button" @click="$emit('click')">
    <i :class="iconClass"></i>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "tyde-button",
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconClass: function() {
      return `fas fa-${this.icon}`
    },
  },
}
</script>

<style lang="scss" scoped>
.tyde-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  border: 4px solid black;
  background: white;
  font-size: 30px;
  margin-right: 16px;
  transition: all 0.2s ease;

    &:last-child {
        margin-right: 0;
    }

    &:before {
        content: "";
        position: absolute;
        top: -7px;
        left: -7px;
        right: -7px;
        bottom: -7px;
        background: transparent;
        border: 3px solid var(--tapestry-light-gray);
        border-radius: 50%;
    }

    &:focus {
        outline: none;
    }

    &:hover {
        background: var(--tapestry-light-blue);
        color: white;
        transform: scale(1.1);
    }
}
</style>
