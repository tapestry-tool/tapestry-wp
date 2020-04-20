<template>
  <button
    :class="['tyde-button', { 'has-label': label.length > 0 }]"
    :style="cssProps"
    @click="$emit('click')"
  >
    <i v-if="icon.length" :class="iconClass"></i>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "tyde-button",
  props: {
    icon: {
      type: String,
      required: false,
      default: "",
    },
    label: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    iconClass: function() {
      return `fas fa-${this.icon}`
    },
    cssProps() {
      return {
        "--button-label": `" ${this.label}"`,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tyde-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  background: white;
  font-size: 30px;
  margin-right: 16px;
  transition: all 0.2s ease;
  padding: 0em 0.4em;
  box-shadow: 0 0 20px -8px #000;

  &.has-label {
    width: auto;
    justify-content: flex-start;

    i {
      margin-right: 8px;
      margin-left: 0px;
      margin-bottom: 2px;
      padding: 0px;
    }
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

  &:hover:not(:disabled) {
    background: var(--tapestry-light-blue);
    color: white;
    transform: scale(1.1);
  }

  &:disabled {
    color: #999;
    opacity: 0.8;
    cursor: default;
    box-shadow: none;
  }
}
</style>
