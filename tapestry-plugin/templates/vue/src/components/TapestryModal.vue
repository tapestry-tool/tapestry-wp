<template>
  <div class="modal-container">
    <div v-if="allowClose" class="overlay" @click="$emit('close')"></div>
    <transition name="modal">
      <div v-if="load" class="content" :style="contentContainerStyle">
        <div class="buttons-container">
          <modal-button v-if="allowClose" icon="times" @clicked="$emit('close')" />
          <modal-button
            icon="heart"
            icon-size="sm"
            :title="favourited ? 'Remove from Favourites' : 'Add to Favourites'"
            :icon-color="favourited ? 'red' : ''"
            :bg-color="favourited ? '#fff' : ''"
            :bg-hover-color="favourited ? '#fff' : 'red'"
            @clicked="toggleFavourite(nodeId)"
          />
        </div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import ModalButton from "./ModalButton"

const defaultStyles = {
  top: "150px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "600px",
  height: "400px",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}

export default {
  name: "tapestry-modal",
  components: {
    ModalButton,
  },
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
    showFav: {
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
  computed: {
    ...mapGetters(["isFavourite"]),
    favourited() {
      return this.isFavourite(this.nodeId)
    },
  },
  mounted() {
    this.load = true
  },
  methods: {
    ...mapActions(["toggleFavourite"]),
  },
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

    .buttons-container {
      position: absolute;
      display: flex;
      flex-direction: row-reverse;
      width: 100%;
      top: -20px;
      right: -20px;
      z-index: 1000;
    }
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
