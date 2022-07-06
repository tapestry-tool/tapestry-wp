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
        <div v-if="hasWarnings">
          <p>
            The following
            <b>warnings</b>
            were generated during import:
          </p>
          <b-table
            small
            borderless
            :items="nodeWarnings"
            :fields="['title', 'warnings']"
            thead-class="d-none"
            data-qa="import-warnings-table"
          >
            <template v-if="settingsWarnings.length" slot="bottom-row">
              <b-td><b>Tapestry Settings:</b></b-td>
              <b-td>
                <li v-for="warning in settingsWarnings" :key="warning">
                  {{ warning }}
                </li>
              </b-td>
            </template>
            <template #cell(title)="{value}">{{ value }}:</template>
            <template #cell(warnings)="{value}">
              <li v-for="warning in value" :key="warning">
                {{ warning }}
              </li>
            </template>
          </b-table>
          <p>
            Nodes with warnings have been imported as-is. Please edit them to check
            their contents.
          </p>
        </div>
        <div v-else>
          No warnings were generated during import.
        </div>
        <div>
          Pressing "Confirm" will reload your page.
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
  props: {
    changes: {
      type: Object,
      required: true,
    },
    warnings: {
      type: Object,
      required: true,
    },
  },
  computed: {
    nodeWarnings() {
      return this.warnings.nodes
        ? this.warnings.nodes.filter(
            nodeWarningData => nodeWarningData.warnings.length > 0
          )
        : []
    },
    settingsWarnings() {
      return this.warnings.settings
    },
    hasWarnings() {
      return (
        Object.keys(this.warnings).length > 0 &&
        (this.nodeWarnings.length > 0 || this.settingsWarnings.length > 0)
      )
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
