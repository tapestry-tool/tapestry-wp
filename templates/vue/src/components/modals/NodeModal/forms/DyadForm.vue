<template>
  <div>
    <h6 class="mt-4 mb-3">
      Dyad Node
    </h6>
    <b-form-group>
      <b-form-checkbox v-model="node.isDyad">
        This is a dyad node
      </b-form-checkbox>
    </b-form-group>
    <small id="emailHelp" class="form-text text-muted">
      This checkbox only affects users who have a dyad role and a linked teen. When
      checked, dyad users will see their linked partner's progress for this node
      instead of their own and their own progress will not be saved. Furthermore,
      dyad users will not be able to answer any activity nodes marked as dyad. Please
      note that children of dyad nodes will be automatically treated as dyad nodes as
      well, even if not marked as dyad nodes.
    </small>
  </div>
</template>

<script>
export default {
  name: "dyad-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>
