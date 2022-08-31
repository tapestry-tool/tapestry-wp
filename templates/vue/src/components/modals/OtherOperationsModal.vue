<template>
  <b-modal
    id="other-operations-modal"
    data-qa="other-operations-modal"
    :visible="show"
    size="lg"
    title="Other Operations"
    scrollable
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-1">
      <b-form-group
        label="Thumbnail optimization"
        description="This will convert all existing thumbnails into optimized thumbnails"
      >
        <b-button
          id="optimize-thumbnails-button"
          block
          variant="light"
          :class="isOptimizing ? 'disabled' : ''"
          :disabled="isOptimizing"
          @click="optimizeThumbnails"
        >
          <b-spinner v-if="isOptimizing" small></b-spinner>
          <div :style="isOptimizing ? 'opacity: 50%;' : ''">
            Optimize All Thumbnails
          </div>
        </b-button>
      </b-form-group>
      <b-alert :show="hasOptimized" variant="success" style="margin-top: 1em;">
        Thumbnails have been successfully optimized!
      </b-alert>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import client from "@/services/TapestryAPI"

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isOptimizing: false,
      hasOptimized: false,
    }
  },
  methods: {
    closeModal() {
      this.$root.$emit("bv::hide::modal", "other-operations-modal")
    },
    async optimizeThumbnails() {
      this.isOptimizing = true
      client
        .optimizeNodeThumbnails()
        .finally(() => {
          this.isOptimizing = false
          this.hasOptimized = true
          setTimeout(() => {
            this.hasOptimized = false
          }, 10000)
        })
        .catch(err => {
          console.log(err)
          this.$bvToast.toast(
            "Sorry, an error occurred. Some or all of the nodes were not optimized.",
            {
              title: "Optimization did not complete",
              variant: "danger",
            }
          )
        })
    },
  },
}
</script>

<style lang="scss" scoped>
#optimize-thumbnails-button {
  position: relative;
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
  }
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
