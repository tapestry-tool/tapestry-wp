<template>
  <transition name="fade">
    <div v-show="shouldShow" ref="popper" class="context-toolbar-container">
      <div class="tapestry-context-toolbar">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
import { createPopper } from "@popperjs/core"

const defaultPosition = {
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
}

export default {
  model: {
    prop: "show",
    event: "set-show",
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    // should provide one of position (for virtual element) or target (element ID of actual element):
    position: {
      type: Object,
      required: false,
      default: null,
    },
    target: {
      type: String,
      required: false,
      default: null,
    },
    placement: {
      type: String,
      required: false,
      default: "top",
    },
    offset: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      popper: null,
    }
  },
  computed: {
    shouldShow() {
      return this.show && (this.target !== null || this.position !== null)
    },
    virtualTarget() {
      return {
        getBoundingClientRect: () => this.position ?? defaultPosition,
      }
    },
  },
  watch: {
    shouldShow(show) {
      if (show) {
        this.popper?.update()
      }
    },
    position: {
      handler(position) {
        if (position !== null && this.shouldShow) {
          this.popper?.update()
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.$emit("set-show", false)
    })
    this.popper = createPopper(
      this.target ? document.getElementById(this.target) : this.virtualTarget,
      this.$refs.popper,
      {
        placement: this.placement,
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, this.offset],
            },
          },
        ],
      }
    )
  },
}
</script>

<style lang="scss" scoped>
.context-toolbar-container {
  background-color: #ededed;
  border: 2px solid #f8f8f8;
  border-radius: 9px;
  z-index: 100;
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
.tapestry-toolbar-separator {
  width: 2px;
  background-color: #f8f8f8;
}
.tapestry-context-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;

  &:first-child > :first-child {
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
  }

  &:last-child > :last-child {
    border-top-right-radius: 9px;
    border-bottom-right-radius: 9px;
  }
}
</style>
