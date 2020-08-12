<template>
  <b-modal
    id="import-changelog"
    title="Changes from Import"
    size="lg"
    class="text-muted"
    body-class="p-0"
  >
    <div>{{ changes }}</div>
  </b-modal>
</template>

<script>
export default {
  name: "import-changelog",
  data() {
    return {
      changes: "changes here",
    }
  },
}
</script>

<style lang="scss" scoped>
/* overwrite bootstrap styles */
.modal-header {
  background: #f7f7f7;
  border: none;
  padding-bottom: 0;
  margin-left: 5px;
  flex-direction: column;

  button.close {
    position: absolute;
    top: 15px;
    right: 12px;

    &:focus {
      outline: none;
    }
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
