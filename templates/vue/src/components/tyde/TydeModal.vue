<template>
  <div class="tyde-interface">
    <div class="modal-container">
      <!-- <div v-if="allowClose" class="overlay" @click="$emit('close')"></div> -->
      <transition name="modal">
        <div v-if="load" class="content">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "tyde-modal",
  props: {
    nodeId: {
      type: [String, Number],
      required: false,
      default: 0,
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
.tyde-interface {
  position: fixed;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  padding: 30px auto 30px auto;
  z-index: 1;
}

.modal-container {
  position: fixed;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: black;
  overflow: scroll;

  &.full-screen {
    .content {
      max-width: 100%;
      margin: 0;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100vh;
      display: flex;
      background-color: black;
    }
  }
}

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

// ORIGINAL
// .content {
//   position: absolute;
//   z-index: 100;
//   background-position: 0 0;
//   background-size: cover;
//   background-color: black;
//   box-shadow: 0 0 100px -40px #000;
//   border-radius: 15px;
//   height: 100%;
// }

// FULLSCREEN
// .content {
//   max-width: 100%;
//   margin: 0;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   height: 100vh;
//   display: flex;
//   background-color: black;
// }
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
