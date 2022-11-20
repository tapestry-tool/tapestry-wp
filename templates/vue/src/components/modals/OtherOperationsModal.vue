<template>
  <b-modal
    id="other-operations-modal"
    data-qa="other-operations-modal"
    :visible="show"
    size="lg"
    title="Other Operations"
    scrollable
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-1">
      <b-form-group
        label="Thumbnail optimization"
        description="This will convert all existing thumbnails into optimized thumbnails to improve loading speed"
      >
        <b-row>
          <b-col lg="6">
            <b-button
              id="optimize-thumbnails-button"
              class="perform-operation-button"
              block
              variant="primary"
              :class="isOptimizing ? 'disabled' : ''"
              :disabled="isOptimizing"
              @click="optimizeThumbnails"
            >
              <b-spinner v-if="isOptimizing" small></b-spinner>
              <div :style="isOptimizing ? 'opacity: 50%;' : ''">
                Optimize All Thumbnails
              </div>
            </b-button>
          </b-col>
        </b-row>
      </b-form-group>
      <b-alert :show="hasOptimized" variant="success" style="margin-top: 1em;">
        Thumbnails have been successfully optimized!
      </b-alert>
      <b-card>
        <b-card-title>Transform Tapestry</b-card-title>
        <b-card-text>
          Transform the tapestry into a zoomable structure where the levels of nodes
          are automatically determined by the connections between nodes.
        </b-card-text>
        <b-card-text class="text-muted">
          Currently, the algorithm does not work well when there are loops within the
          tapestry. You can always make adjustments to the levels of nodes in the
          node toolbar after transforming.
        </b-card-text>
        <b-row>
          <b-col lg="6">
            <b-form-group
              label="Root Node"
              description="Select which node to use as the root node."
            >
              <b-form-select
                id="transform-starting-node"
                v-model="transformStartingNode"
                :options="nodeOptions"
              ></b-form-select>
            </b-form-group>
            <b-button
              id="transform-tapestry-zoomable"
              class="perform-operation-button"
              block
              variant="primary"
              :class="isTransforming ? 'disabled' : ''"
              :disabled="isTransforming"
              @click="transformTapestry"
            >
              <b-spinner v-if="isTransforming" small></b-spinner>
              <div :style="isTransforming ? 'opacity: 50%;' : ''">
                Transform Tapestry
              </div>
            </b-button>
          </b-col>
        </b-row>
      </b-card>
    </b-container>
  </b-modal>
</template>

<script>
import client from "@/services/TapestryAPI"
import { mapState } from "vuex"

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
      isTransforming: false,
      transformStartingNode: null,
    }
  },
  computed: {
    ...mapState(["nodes", "rootId"]),
    nodeOptions() {
      return Object.values(this.nodes)
        .filter(node => node.id !== this.nodeId)
        .map(node => ({
          value: node.id,
          text: node.title,
        }))
    },
  },
  created() {
    this.transformStartingNode = this.rootId
      ? this.rootId
      : this.nodeOptions[0]?.value
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
    async transformTapestry() {
      this.isTransforming = true
      client
        .transformTapestry(this.transformStartingNode)
        .then(response => {
          const success = !!response.data
          if (success) {
            this.$bvModal
              .msgBoxOk(
                "The tapestry has been transformed into a zoomable structure! Refresh the page to see the updated tapestry.",
                {
                  modalClass: "node-modal-confirmation",
                  title: "Transformation Complete",
                  okTitle: "Refresh",
                }
              )
              .then(() => {
                location.hash = "" // so the operations modal will not be opened after refresh
                location.reload()
              })
          }
        })
        .catch(err => {
          console.log(err)
          this.$bvToast.toast("An error occured while transforming the tapestry.", {
            title: "Transformation did not complete",
            variant: "danger",
          })
        })
        .finally(() => {
          this.isTransforming = false
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.perform-operation-button {
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
