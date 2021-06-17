<template>
  <div class="modal-container">
    <div v-if="allowClose" class="overlay" @click="$emit('close')"></div>
    <transition name="modal">
      <div v-if="load" class="content" :style="contentContainerStyle">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
const defaultStyles = {
  top: "1000px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "1000px",
  height: "1000px",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}

export default {
  name: "tyde-modal",
  props: {
    nodeId: {
      type: [String, Number],
      required: false,
      default: 0,
    },
    contentContainerStyle: {
      type: Object,
      required: false,
      default: () => defaultStyles,
    },
    allowClose: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      load: false,
    }
  },
  computed: {},
  mounted() {
    this.load = true
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  .content {
    position: absolute;
    z-index: 100;
    background-position: 0 0;
    background-size: cover;
    background-color: black;
    box-shadow: 0 0 100px -40px #000;
    border-radius: 15px;
    height: 100%;
  }

  &.full-screen {
    .content {
      .buttons-container {
        top: 20px;
        right: 30px;
      }
    }
  }
}
</style>

<style lang="scss">
.modal-enter-active,
.modal-leave-active {
  transition: all 1s;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
</style>
