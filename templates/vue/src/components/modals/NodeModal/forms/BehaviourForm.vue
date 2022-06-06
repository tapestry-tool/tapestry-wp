<template>
  <div id="modal-behaviour">
    <b-form-group>
      <b-form-checkbox
        v-if="mediaType !== 'multi-content'"
        v-model="skippable"
        data-testid="node-behaviour-skippable"
      >
        Allow skipping video if user has not watched at least once
      </b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script>
import { mapState } from "vuex"
export default {
  computed: {
    ...mapState({
      mediaType: state => state.currentEditingNode.mediaType,
    }),
    skippable: {
      get() {
        return this.$store.state.currentEditingNode.skippable
      },
      set(value) {
        this.$store.commit("setCurrentEditingNodeProperty", {
          property: "skippable",
          value,
        })
      },
    },
  },
}
</script>
