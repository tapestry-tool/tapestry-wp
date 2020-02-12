<template>
  <button class="tyde-button" @click="$emit('click')" :style="cssProps">
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
    label: {
      type: String
    },
  },
  computed: {
    iconClass: function() {
      return `fas fa-${this.icon}`
    },
    cssProps() { return {
      '--button-label': `" ${this.label}"`,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tyde-button {
  position: relative;
  width: auto;
  height: 60px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  color: black;
  background: white;
  font-size: 30px;
  margin-right: 16px;
  transition: all 0.2s ease;

  i {
    margin-right: 8px;
    margin-left: 0px;
    margin-bottom: 2px;
    padding: 0px;
  }

  &:last-child {

    i {
      margin: 0px;
    }

    justify-content: center;
    margin-right: 0;
  }

  &:after {
    background: transparent;
    content: var(--button-label);
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
