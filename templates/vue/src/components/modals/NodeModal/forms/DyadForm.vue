<template>
  <div>
    <b-form-group>
      <b-form-checkbox v-model="node.isDyad" @change="updateChild">
        This is a dyad node
      </b-form-checkbox>
    </b-form-group>
    <small id="emailHelp" class="form-text text-muted">
      This checkbox only affects users who have a dyad role and a linked teen. When checked, dyad users will see their linked teen's progress for this node instead of their own and their own progress will not be saved.
    </small>
  </div>
</template>

<script>
import { mapActions } from "vuex"

export default {
  name: "dyad-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions([
      "updateNode",
    ]),
    updateChild(val) {
      console.log(val)
      if (this.node.mediaType == "multi-content") {
        for (const nodeId of this.node.childOrdering) {
          const childNode = this.$store.getters.getNode(nodeId)
          childNode.isDyad = val
          this.updateNode({
            id: nodeId,
            newNode: childNode,
          })
        }
      }
    },
  },
}
</script>
