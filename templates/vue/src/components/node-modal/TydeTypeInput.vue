<template>
  <b-form-group label="TYDE Node Type">
    <b-form-select
      v-model="node.tydeType"
      :disabled="showModuleWarning"
      :options="tydeTypeOptions"
    ></b-form-select>
    <b-form-text v-if="showModuleWarning">
      You cannot change the module type because the node still has stages as children.
    </b-form-text>
  </b-form-group>
</template>

<script>
import { nodeTypes } from "../../utils/constants"
import { mapGetters } from 'vuex'

export default {
  name: 'tyde-type-input',
  props: {
    node: {
      type: Object,
      required: true
    },
    parent: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren"]),
    hasChildren() {
      return this.getDirectChildren(this.node.id).length > 0
    },
    tydeTypeOptions() {
      const options = Object.values(nodeTypes)
      if (this.parent) {
        if (this.parent.tydeType === nodeTypes.MODULE) {
          // if parent is a module, only allow stage nodes
          return [nodeTypes.STAGE]
        } else if (this.parent.tydeType === nodeTypes.STAGE) {
          // if parent is a stage, only allow question sets
          return [nodeTypes.QUESTION_SET]
        }
      }
      const normalOptions = options.filter(
        opt => opt !== nodeTypes.STAGE && opt !== nodeTypes.QUESTION_SET
      )

      // if a module and has children, return only the module option.
      if (this.hasChildren && this.node.tydeType === nodeTypes.MODULE) {
        return [nodeTypes.MODULE]
      }
      return normalOptions
    },
    showModuleWarning() {
      return this.hasChildren && this.node.tydeType === nodeTypes.MODULE
    },
  },
}
</script>
