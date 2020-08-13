<template>
  <b-modal
    id="import-changelog"
    title="Changes from Import"
    size="lg"
    class="text-muted"
    body-class="p-0"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close
  >
    <b-container fluid class="px-0">
      <b-card>
        <div v-if="changes.noChange">No changes were made in import</div>
        <div v-else>
          All authors have been set to the current user.
          <br />
          The following permissions for user groups were on the old site, but do not
          exist on this site and were removed.
          <br />
          These also include user-specific permissions, which were all removed by
          default.
          <li v-for="perm in changes.permissions" :key="perm">
            {{ perm }}
          </li>
          <div>Pressing confirm will reload your page</div>
        </div>
      </b-card>
    </b-container>
    <div slot="modal-footer">
      <b-button @click="confirmReload">Confirm</b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: "import-changelog",
  props: ["changes"],
  methods: {
    confirmReload() {
      location.reload()
    },
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
