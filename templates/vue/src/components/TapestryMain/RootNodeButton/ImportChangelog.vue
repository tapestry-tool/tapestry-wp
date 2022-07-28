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
        <h2>Import Successful!</h2>
        <b-alert :show="exportWarnings" variant="warning">
          The file you provided was exported with warnings. Even if there are no
          import warnings, we recommend checking that all your content is present.
        </b-alert>
        <div v-if="changes.noChange">No changes were made in import.</div>
        <div v-else>
          <p>All authors have been set to the current user.</p>
          The following
          <b>permissions</b>
          for user groups were on the old site, but do not exist on this site and
          were removed. These also include user-specific permissions, which were all
          removed by default.
          <ul data-qa="import-removed-permissions">
            <li v-for="perm in changes.permissions" :key="perm">
              {{ perm }}
            </li>
          </ul>
        </div>
        <import-warnings :warnings="warnings" action="import"></import-warnings>
        <p>
          Pressing "Confirm" will reload the page.
        </p>
      </b-card>
    </b-container>
    <div slot="modal-footer">
      <b-button @click="confirmReload">Confirm</b-button>
    </div>
  </b-modal>
</template>

<script>
import ImportExportWarnings from "@/components/common/ImportExportWarnings"

export default {
  name: "import-changelog",
  components: {
    "import-warnings": ImportExportWarnings,
  },
  props: {
    changes: {
      type: Object,
      required: true,
    },
    warnings: {
      type: Object,
      required: true,
    },
    exportWarnings: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    confirmReload() {
      location.reload()
    },
  },
}
</script>

<style lang="scss" scoped>
/* overwrite Tapestry table style */
table {
  border: 0;
}

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
