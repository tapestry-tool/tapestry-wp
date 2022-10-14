<template>
  <b-modal
    id="export-duplicate-modal"
    :visible="show"
    size="md"
    title="Export / Duplicate Tapestry"
    scrollable
    body-class="p-0"
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0" data-qa="export-duplicate-modal">
      <b-tabs card>
        <b-tab
          title="Export"
          :active="tab === 'export'"
          class="position-relative"
          @click="$emit('change:tab', 'export')"
        >
          <b-form-group label="Export Tapestry">
            <export-tapestry-button />
          </b-form-group>
        </b-tab>
        <b-tab
          title="Duplicate"
          :active="tab === 'duplicate'"
          @click="$emit('change:tab', 'duplicate')"
        >
          <b-form-group label="Duplicate Tapestry">
            <duplicate-tapestry-button />
          </b-form-group>
        </b-tab>
      </b-tabs>
    </b-container>
  </b-modal>
</template>

<script>
import ExportTapestryButton from "./ExportTapestryButton"
import DuplicateTapestryButton from "./DuplicateTapestryButton"

export default {
  components: {
    DuplicateTapestryButton,
    ExportTapestryButton,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    tab: {
      type: String,
      required: false,
      default: "export",
    },
  },
}
</script>
