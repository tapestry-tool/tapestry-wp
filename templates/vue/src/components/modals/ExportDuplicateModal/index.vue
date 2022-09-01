<template>
  <b-modal
    id="export-duplicate-modal"
    data-qa="export-duplicate-modal"
    :visible="show"
    size="lg"
    title="Export / Duplicate Tapestry"
    scrollable
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-1">
      <b-row>
        <b-col>
          <b-form-group
            label="Export"
            description="Export your tapestry to a file. You can then use that file to import this tapestry on another site."
          >
            <b-dropdown
              block
              split
              variant="primary"
              menu-class="w-100"
              data-qa="export-tapestry-button"
              :toggle-attrs="{
                'data-qa': 'export-type-toggle',
              }"
              :split-class="{
                'export-button': true,
                disabled: isExporting,
              }"
              :disabled="isExporting"
              @click="exportTapestry"
            >
              <template #button-content>
                <b-spinner v-if="isExporting" small></b-spinner>
                <div :style="isExporting ? 'opacity: 50%;' : ''">
                  Export Tapestry
                </div>
              </template>
              <b-dropdown-item-button @click="exportTapestry">
                Export as JSON
              </b-dropdown-item-button>
              <b-dropdown-item-button @click="exportTapestryAsZip">
                Export as ZIP (include uploaded media)
              </b-dropdown-item-button>
            </b-dropdown>
            <b-alert
              v-if="apiError == null"
              :show="hasExported"
              :variant="exportWarnings ? 'warning' : 'success'"
              style="margin-top: 1em;"
            >
              <div v-if="!exportWarnings">
                Your content has been exported! Find the
                {{ exportedFileType }} file in your downloads.
              </div>
              <export-warnings
                v-else
                :warnings="exportWarnings"
                action="export"
              ></export-warnings>
              <div v-if="hasExportedWpPosts">
                The WordPress posts in this Tapestry have also been exported. Find
                the .xml file in your downloads.
              </div>
            </b-alert>
            <b-alert
              v-else
              :show="hasExported"
              variant="danger"
              style="margin-top: 1em;"
            >
              {{ apiError.error }}
            </b-alert>
            <b-form-text class="my-2">
              <strong>Note:</strong>
              WordPress post nodes in your tapestry must be exported separately. To
              export, export all WordPress posts as well as the tapestry. To import,
              first import the WordPress posts by going to Tools -> Import in the
              WordPress dashboard, then import the tapestry.
            </b-form-text>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Duplicate"
            description="Create a duplicate copy of this tapestry on this site."
          >
            <duplicate-tapestry-button />
          </b-form-group>
        </b-col>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import { mapState, mapActions } from "vuex"
import DuplicateTapestryButton from "./DuplicateTapestryButton"
import ImportExportWarnings from "@/components/common/ImportExportWarnings"
import WordpressApi from "@/services/WordpressApi"

export default {
  components: {
    DuplicateTapestryButton,
    "export-warnings": ImportExportWarnings,
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
      hasExportedWpPosts: false,
      exportedFileType: "",
      exportWarnings: null,
    }
  },
  computed: {
    ...mapState(["settings", "apiError"]),
  },
  methods: {
    ...mapActions(["getTapestryExport", "getTapestryExportAsZip"]),
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
      const exportId = exportedTapestry.exportId
      const blob = new Blob([JSON.stringify(exportedTapestry.json, null, 2)], {
        type: "application/json",
      })
      const fileUrl = URL.createObjectURL(blob)
      this.showFileDownload(fileUrl, `${this.settings.title}_${exportId}.json`)
      URL.revokeObjectURL(fileUrl)

      if (exportedTapestry.wpPosts) {
        this.downloadWpPosts(exportedTapestry.wpPosts, exportId)
        this.hasExportedWpPosts = true
      }

      this.isExporting = false
      this.hasExported = true
      this.exportedFileType = ".json"
    },
    async exportTapestryAsZip() {
      this.isExporting = true

      // Rebuild H5P cache before exporting to ensure H5P export files are up to date
      await WordpressApi.rebuildAllH5PCache()

      const exportedTapestry = await this.getTapestryExportAsZip()
      if (!exportedTapestry) {
        this.isExporting = false
        this.hasExported = true
        return
      }
      const exportId = exportedTapestry.exportId
      const fileUrl = exportedTapestry.zipUrl
      this.showFileDownload(fileUrl, `${this.settings.title}_${exportId}.zip`)

      if (exportedTapestry.wpPosts) {
        this.downloadWpPosts(exportedTapestry.wpPosts, exportId)
        this.hasExportedWpPosts = true
      }

      this.isExporting = false
      this.hasExported = true
      this.exportedFileType = ".zip"

      if (this.hasWarnings(exportedTapestry)) {
        this.exportWarnings = exportedTapestry.warnings
      } else {
        this.exportWarnings = null
      }
    },
    hasWarnings(exportedTapestry) {
      return (
        exportedTapestry.warnings.nodes.length > 0 ||
        exportedTapestry.warnings.settings.length > 0
      )
    },
    downloadWpPosts(exportedPosts, exportId) {
      const blob = new Blob([exportedPosts], {
        type: "application/xml",
      })
      const fileUrl = URL.createObjectURL(blob)
      this.showFileDownload(
        fileUrl,
        `${this.settings.title}-WP-Posts_${exportId}.xml`
      )
      URL.revokeObjectURL(fileUrl)
    },
    showFileDownload(fileUrl, fileName) {
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = fileUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
  },
}
</script>

<style lang="scss" scoped>
.export-button {
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
