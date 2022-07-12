<template>
  <div class="modal-container">
    <div v-if="allowClose" class="overlay" @click="$emit('close')"></div>
    <transition name="modal">
      <div v-if="load" class="content" :style="contentContainerStyle">
        <div class="buttons-container">
          <modal-button
            v-if="allowClose"
            data-qa="close-lightbox"
            icon="times"
            @clicked="$emit('close')"
          />
          <modal-button
            icon="heart"
            icon-size="sm"
            :title="isFavourite ? 'Remove from Favourites' : 'Add to Favourites'"
            :icon-color="isFavourite ? 'red' : ''"
            :bg-color="isFavourite ? '#fff' : ''"
            :bg-hover-color="isFavourite ? '#fff' : 'red'"
            @clicked="toggleFavourite(node.id)"
          />
          <modal-button
            v-if="canEditNode"
            icon="pencil-alt"
            icon-size="sm"
            title="Edit Node"
            @clicked="editNode"
          />
        </div>
        <div class="content-cutoff">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex"
import ModalButton from "./ModalButton"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"

const defaultStyles = {
  top: "150px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "600px",
  height: "400px",
  color: "#eeeeee",
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
    node: {
      type: Object,
      required: false,
      default: () => {
        null
      },
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
    ...mapState(["favourites"]),
    isFavourite() {
      return this.favourites.find(id => id == this.node.id)
    },
    canEditNode() {
      return Helpers.hasPermission(this.node, "edit")
    },
  },
  mounted() {
    this.load = true
  },
  methods: {
    ...mapActions(["toggleFavourite"]),
    ...mapMutations(["setReturnRoute"]),
    editNode() {
      this.setReturnRoute(this.$route)
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "edit", tab: "content" },
        query: { from: "lightbox" },
      })
    },
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
    background: var(--bg-color-secondary);
    color: var(--text-color-primary);
    background-position: 0 0;
    background-size: cover;
    box-shadow: 0 0 100px -40px #000;
    border-radius: 15px;
    height: 100%;

    .content-cutoff {
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    .buttons-container {
      position: absolute;
      display: flex;
      flex-direction: row-reverse;
      top: -20px;
      right: -20px;
      z-index: 1000;
    }
  }

  &.full-screen {
    .content {
      border-radius: 0;

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
