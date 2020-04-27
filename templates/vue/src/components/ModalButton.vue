<template>
  <button
    class="modal-button"
    :style="buttonStyles"
    @click="$emit('clicked')"
    @mouseover="hovering = true"
    @mouseout="hovering = false"
  >
    <i :class="iconClasses" :style="iconStyles"></i>
  </button>
</template>

<script>
export default {
  name: "modal-button",
  props: {
    icon: {
      type: String,
      required: false,
    },
    iconSize: {
      type: String,
      required: false,
      default: "",
    },
    iconColor: {
      type: String,
      required: false,
      default: "",
    },
    bgColor: {
      type: String,
      required: false,
      default: "",
    },
    bgHoverColor: {
      type: String,
      required: false,
      default: "#11a6d8",
    },
  },
  data() {
    return {
      hovering: false,
    }
  },
  computed: {
    buttonStyles() {
      if (this.hovering && this.bgHoverColor.length) {
        return { backgroundColor: this.bgHoverColor }
      } else if (this.bgColor.length) {
        return { backgroundColor: this.bgColor }
      }
      return {}
    },
    iconClasses() {
      let classes = "fas fa-" + this.icon
      if (this.iconSize.length) {
        classes += " fa-" + this.iconSize
      }
      return classes
    },
    iconStyles() {
      if (this.iconColor.length) {
        return { color: this.iconColor }
      }
      return ""
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-button {
  display: flex;
  flex-direction: column;
  outline: none;
  margin: 3px;
  background: #666;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2em;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.16);
  transition: all 0.25s ease;
  border: solid 2px #fff;
  &:hover {
    transform: scale(1.15);
  }
  i {
    background: none;
  }
}
</style>
