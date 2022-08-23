<template>
  <b-modal
    id="export-duplicate-modal"
    data-qa="export-duplicate-modal"
    :visible="show"
    size="lg"
    title="Export/Duplicate Tapestry"
    scrollable
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-1">
      <b-form-group
        label="Export/Duplicate"
        description="Export your tapestry to a file and then you can import it on another site.
              Duplicating will create a copy of this tapestry on this site."
      >
        <b-row class="mb-2">
          <b-col>
            <b-button
              id="export-button"
              block
              variant="light"
              :class="isExporting ? 'disabled' : ''"
              :disabled="isExporting"
              @click="exportTapestry"
            >
              <b-spinner v-if="isExporting" small></b-spinner>
              <div :style="isExporting ? 'opacity: 50%;' : ''">
                Export Tapestry
              </div>
            </b-button>
            <b-alert
              v-if="apiError == null"
              :show="hasExported"
              variant="success"
              style="margin-top: 1em;"
            >
              Your Tapestry has been exported! Find the .json file in your downloads.
            </b-alert>
            <b-alert
              v-else
              :show="hasExported"
              variant="danger"
              style="margin-top: 1em;"
            >
              {{ apiError.error }}
            </b-alert>
          </b-col>
          <b-col>
            <duplicate-tapestry-button />
          </b-col>
        </b-row>
      </b-form-group>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapState, mapActions } from "vuex"
import DuplicateTapestryButton from "./DuplicateTapestryButton"

export default {
  components: {
    DuplicateTapestryButton,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isExporting: false,
      hasExported: false,
    }
  },
  computed: {
    ...mapState(["settings", "apiError"]),
  },
  methods: {
    ...mapActions(["getTapestryExport"]),
    closeModal() {
      this.$root.$emit("bv::hide::modal", "export-duplicate-modal")
    },
    async exportTapestry() {
      this.isExporting = true
      const exportedTapestry = await this.getTapestryExport()
      if (!exportedTapestry) {
        this.isExporting = false
        this.hasExported = true
        return
      }
      const blob = new Blob([JSON.stringify(exportedTapestry, null, 2)], {
        type: "application/json",
      })
      const fileUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = fileUrl
      a.download = `${this.settings.title}.json`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(fileUrl)
      document.body.removeChild(a)

      this.isExporting = false
      this.hasExported = true
    },
  },
}
</script>

<style lang="scss" scoped>
#export-button {
  position: relative;
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
  }
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
