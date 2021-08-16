<template>
  <div>
    <b-form-group>
      <b-form-checkbox v-model="node.isDyad">
        This is a dyad node
      </b-form-checkbox>
    </b-form-group>
    <small id="emailHelp" class="form-text text-muted">
      This checkbox only affects users who have a dyad role and a linked teen. When checked, dyad users will see their linked teen's progress for this node instead of their own and their own progress will not be saved.
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
