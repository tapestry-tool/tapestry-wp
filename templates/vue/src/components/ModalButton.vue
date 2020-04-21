<template>
  <button class="modal-button" :style="buttonStyle" @click="$emit('clicked')">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "modal-button",
  props: {
    buttonStyle: {
      type: Object,
      reuired: false,
      default: () => {},
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-button {
  width: auto;
  display: flex;
  justify-content: flex-end;
  background: none;
  border: none;
  outline: none;
  position: absolute;
  top: -37px;
  z-index: 20;

  > div {
    background: #666;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2em;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.16);
    transition: all 0.25s ease;
    border: solid 2px #fff;

    &:hover {
      transform: scale(1.15);
      background: #11a6d8;
    }

    i {
      background: none;
    }
  }
}
</style>
