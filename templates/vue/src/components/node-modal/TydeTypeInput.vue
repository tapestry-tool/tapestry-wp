<template>
  <b-form-group label="TYDE Node Type">
    <b-form-select
      v-model="node.tydeType"
      :options="tydeTypeOptions"
    ></b-form-select>
  </b-form-group>
</template>

<script>
import { nodeTypes } from "../../utils/constants"

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
      return options.filter(
        opt => opt !== nodeTypes.STAGE && opt !== nodeTypes.QUESTION_SET
      )
    }
  }
}
</script>
