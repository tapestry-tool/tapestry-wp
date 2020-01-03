<template>
  <b-form-group label="TYDE Node Type">
    <b-form-select
      v-model="node.tydeType"
      :disabled="disableSelect"
      :options="tydeTypeOptions"
    ></b-form-select>
    <b-form-text v-if="showModuleWarning">
      You cannot change the module type because the node still has stages as
      children.
    </b-form-text>
  </b-form-group>
</template>

<script>
import { tydeTypes } from "../../utils/constants"
import { mapGetters } from "vuex"

export default {
  name: "tyde-type-input",
  props: {
    node: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    ...mapGetters(["getDirectChildren"]),
    hasChildren() {
      return this.getDirectChildren(this.node.id).length > 0
    },
    tydeTypeOptions() {
      const options = Object.values(tydeTypes)
      if (this.parent) {
        if (this.parent.tydeType === tydeTypes.MODULE) {
          // if parent is a module, only allow stage nodes
          return [tydeTypes.STAGE]
        } else if (this.parent.tydeType === tydeTypes.STAGE) {
          // if parent is a stage, only allow question sets
          return [tydeTypes.QUESTION_SET]
        }
      }
      const normalOptions = options.filter(
        opt => opt !== tydeTypes.STAGE && opt !== tydeTypes.QUESTION_SET
      )

      // if a module and has children, return only the module option.
      if (this.hasChildren && this.node.tydeType === tydeTypes.MODULE) {
        return [tydeTypes.MODULE]
      }
      return normalOptions
    },
    showModuleWarning() {
      return this.hasChildren && this.node.tydeType === tydeTypes.MODULE
    },
    disableSelect() {
      return this.tydeTypeOptions.length === 1
    },
  },
}
</script>
