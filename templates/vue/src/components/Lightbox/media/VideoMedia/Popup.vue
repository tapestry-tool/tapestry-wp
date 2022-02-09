<template>
  <div class="popup-wrapper" :class="{ fullscreen }">
    <div class="popup-header">
      <a v-if="canEditNode(node)" @click="editNode(node.id)">
        <i class="fas fa-pencil-alt fa-sm"></i>
      </a>
      <a @click="fullscreen = !fullscreen">
        <i v-if="fullscreen" class="fas fa-compress"></i>
        <i v-else class="fas fa-expand"></i>
      </a>
    </div>
    <div class="popup" :style="style">
      <tapestry-media
        v-if="node.mediaType !== 'multi-content'"
        :dimensions="dimensions"
        :node-id="node.id"
        :context="context"
        @complete="handleComplete"
        @close="$emit('continue')"
      />
      <multi-content-media
        v-if="node.mediaType === 'multi-content'"
        :dimensions="dimensions"
        :context="context"
        :node="node"
        @complete="handleComplete"
        @close="$emit('continue')"
      />
    </div>
    <div v-if="completing || isComplete" class="popup-footer">
      <b-alert
        v-if="isComplete && node.mediaType === 'activity'"
        show
        variant="info"
        class="popup-completed-alert"
      >
        You have either already completed this activity or it's optional. You may
        press continue to go back to the video.
      </b-alert>
      <div v-if="completing" class="aside">
        <b-spinner></b-spinner>
      </div>
      <button v-else-if="isComplete" class="aside" @click="$emit('continue')">
        Continue
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex"
import { canEditTapestry } from "@/services/wp"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"

export default {
  components: {
    TapestryMedia: () => import("../TapestryMedia"),
    MultiContentMedia: () => import("../MultiContentMedia/index"),
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      /**
       * Completing a node is done asynchronously, and we want to show a small
       * spinner on the bottom right of the node when this is currently in progress.
       */
      completing: false,
      fullscreen: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    isComplete() {
      if (canEditTapestry()) {
        return true
      }
      const popup = this.getNode(this.node.id)
      if (popup) {
        return popup.completed
      }
      return false
    },
    style() {
      return this.isComplete ? "height: calc(100% - 80px)" : ""
    },
  },
  watch: {
    /**
     * Since the completing function is done in the parent lightbox container, the
     * only way we know if the popup is successfully completed is if the
     * `isComplete` computed property changes.
     */
    isComplete(isComplete) {
      if (isComplete && this.completing) {
        this.completing = false
      }
    },
  },
  methods: {
    ...mapActions(["completeNode"]),
    ...mapMutations(["setReturnRoute"]),
    handleComplete() {
      if (!this.isComplete) {
        this.completing = true
      }
      this.completeNode(this.node.id)
    },
    canEditNode(node) {
      return Helpers.hasPermission(node, "edit")
    },
    editNode(id) {
      this.setReturnRoute(this.$route)
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "content" },
      })
    },
  },
}
</script>

<style scoped lang="scss">
div {
  height: 100%;
  position: relative;
}

button {
  &:hover {
    background: var(--tapestry-light-gray);
  }
}

.popup-wrapper.fullscreen {
  position: fixed;
  top: 30px;
  left: 0;
  z-index: 10000;
  height: calc(100% - 60px);
}

.popup-header {
  position: absolute;
  z-index: 100;
  top: 15px;
  right: 15px;
  height: auto;
  i {
    opacity: 0.25;
    cursor: pointer;
  }
}
.popup-footer {
  height: 80px;
  .popup-completed-alert {
    position: absolute;
    left: 1.5em;
    bottom: -16px;
    height: 3em;
  }
  .aside {
    height: auto;
    position: absolute;
    border-radius: 0.5rem;
    right: 0;
    bottom: 0;
    z-index: 50;
  }
}
</style>
