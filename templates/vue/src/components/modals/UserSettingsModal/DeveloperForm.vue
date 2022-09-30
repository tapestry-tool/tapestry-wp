<template>
  <div v-if="scaleConstants">
    <b-alert variant="danger" :show="true">
      READ BEFORE CONTINUING: The settings below are meant for experimenting with the
      zoomable interface. Changing the values beyond the suggested range will lead to
      unexpected results and potentially break the app. The changes made here are not
      saved, meaning they will be reverted after refreshing or going to another
      Tapestry.
    </b-alert>
    <b-form-group
      label="Disable Offset Clamp"
      description="Disables the restriction on how far the user can pan."
    >
      <b-form-checkbox v-model="scaleConstants.disableOffsetClamp" switch>
        Disable Offset Clamp
      </b-form-checkbox>
    </b-form-group>
    <b-row>
      <b-col>
        <b-form-group
          label="Zoom Sensitivity"
          description="Higher means zooms in/out faster"
        >
          <b-form-input v-model="scaleConstants.zoomSensitivity" number />
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          label="Pan Sensitivity"
          description="Higher means pans faster (keep it at 1 for natural panning)"
        >
          <b-form-input v-model="scaleConstants.panSensitivity" number />
        </b-form-group>
      </b-col>
    </b-row>
    <b-form-group
      label="Level Multiplier"
      description="Higher means deep nodes get revealed faster"
    >
      <b-form-input v-model="scaleConstants.levelMultiplier" number />
    </b-form-group>
    <b-form-group
      label="Large Node Growth Suppressor"
      description="Higher means larger nodes grow slower (must be >= 1)"
    >
      <b-form-input v-model="scaleConstants.largeNodeGrowthSupressor" number />
    </b-form-group>
    <b-form-group
      label="Max. Node Size to Screen Ratio"
      description="Maximum allowed value of: (radius of the deepest node) / min(viewWidth, viewHeight)"
    >
      <b-form-input v-model="scaleConstants.maxNodeSizeToScreen" number />
    </b-form-group>
    <b-form-group
      label="Min. Tapestry Size to Screen Ratio"
      description="Minimum allowed value of: tapestryWidth / viewWidth"
    >
      <b-form-input v-model="scaleConstants.minTapestrySizeToScreen" number />
    </b-form-group>
    <b-form-group
      label="Line Width Ratio"
      description="Higher means links are thicker relative to the node size"
    >
      <b-form-input v-model="scaleConstants.lineWidthRatio" number />
    </b-form-group>
    <b-card>
      <b-card-text>
        <b>Width Difference Enhancer</b>
      </b-card-text>
      <b-card-text>
        Makes parent-child relationships more apparent by applying the modifiers to
        each end.
      </b-card-text>
      <b-row>
        <b-col>
          <b-form-group
            label="Grow"
            description="Higher means links are thicker at parent end (must be >= 1)"
          >
            <b-form-input
              v-model="scaleConstants.widthDifferenceEnhancer.grow"
              number
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Shrink"
            description="Lower means links are thinner at child end (must be <= 1)"
          >
            <b-form-input
              v-model="scaleConstants.widthDifferenceEnhancer.shrink"
              number
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-card>
    <b-btn class="mt-3" @click="revertChanges">Revert to default settings</b-btn>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import { mapMutations } from "vuex"
import { scaleConstants } from "@/utils/constants"

export default {
  name: "developer-form",
  data() {
    return {
      scaleConstants: null,
    }
  },
  created() {
    this.scaleConstants = Helpers.deepCopy(this.$store.state.scaleConstants)
  },
  methods: {
    ...mapMutations(["setScaleConstants"]),
    revertChanges() {
      this.scaleConstants = Helpers.deepCopy(scaleConstants)
    },
    applyChanges() {
      this.setScaleConstants(this.scaleConstants)
    },
  },
}
</script>
