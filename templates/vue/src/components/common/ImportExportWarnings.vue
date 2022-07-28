<template>
  <div v-if="hasWarnings">
    <p>Your content has been {{ action }}ed with warnings:</p>
    <b-table
      small
      borderless
      :items="nodeWarnings"
      :fields="['title', 'warnings']"
      thead-class="d-none"
      class="warnings-table"
      :data-qa="`${action}-warnings-table`"
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
      Nodes with warnings have been {{ action }}ed as-is. Edit the Tapestry to check
      their contents.
    </p>
  </div>
  <p v-else>No warnings were generated during {{ action }}.</p>
</template>

<script>
export default {
  name: "import-export-warnings",
  props: {
    action: {
      type: String,
      required: true,
      validator: val => val === "import" || val === "export",
    },
    warnings: {
      type: Object,
      required: true,
    },
  },
  computed: {
    nodeWarnings() {
      return this.warnings.nodes
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
}
</script>

<style lang="scss" scoped>
/* overwrite Tapestry table style */
table {
  border: 0;

  &.warnings-table {
    color: inherit;
  }
}
</style>
