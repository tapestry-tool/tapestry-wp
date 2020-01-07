<template>
  <b-form-group label="TYDE Node Type">
    <b-form-select
      v-model="node.tydeType"
      :options="tydeTypeOptions"
    ></b-form-select>
    <b-form-text v-if="disableModuleChange">
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
    ...mapGetters(["getDirectChildren", "getNode"]),
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
      if (this.node.tydeType === tydeTypes.MODULE) {
        return this.disableModuleChange
          ? [tydeTypes.MODULE]
          : [tydeTypes.REGULAR, tydeTypes.MODULE]
      }
      return normalOptions
    },
    disableModuleChange() {
      const children = this.getDirectChildren(this.node.id)
      return (
        this.hasChildren &&
        this.node.tydeType === tydeTypes.MODULE &&
        children.map(this.getNode).every(node => node.tydeType === tydeTypes.STAGE)
      )
    },
  },
}
</script>
