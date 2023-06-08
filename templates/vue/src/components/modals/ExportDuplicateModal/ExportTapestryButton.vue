<template>
  <div>
    <b-form-group class="topright-checkbox">
      <b-form-checkbox
        v-model="includeMedia"
        data-qa="include-media"
        class="mt-2"
        switch
      >
        {{ includeMedia ? "Include media" : "Exclude media" }}
      </b-form-checkbox>
    </b-form-group>
    <b-form-text class="my-2">
      Export your tapestry to a file. You can then use that file to import this
      tapestry on another site.
    </b-form-text>
    <b-form-text v-if="includeMedia && tapestryHasWpNodes" class="my-2">
      <strong>Note:</strong>
      Your Tapestry contains one or more nodes with WordPress posts. These posts will
      be exported for you into a separate file. To import, first import the WordPress
      posts by going to Tools -> Import in the WordPress dashboard, then import the
      tapestry.
    </b-form-text>
    <b-form-checkbox v-model="shouldExportComments" class="pb-1" switch>
      {{
        shouldExportComments ? "Export comments on nodes" : "Don't export comments"
      }}
    </b-form-checkbox>
    <div class="alerts">
      <b-alert
        v-if="apiError == null"
        :show="hasExported"
        :variant="exportWarnings ? 'warning' : 'success'"
        style="margin-top: 1em;"
      >
        <div v-if="!exportWarnings">
          <p>
            This tapestry has been exported!
            <span v-if="exportedFileType === '.json'">
              You can find the {{ exportedFileType }} file in your downloads.
            </span>
          </p>
          <template v-if="exportedFileType === '.zip'">
            <p>
              Your ZIP file contains the following:
            </p>
            <ul>
              <li>
                tapestry.json
              </li>
              <li v-for="(logEntry, i) in exportLog['h5p']" :key="'export-log-' + i">
                H5P: {{ logEntry }}
              </li>
              <li
                v-for="(logEntry, i) in exportLog['media']"
                :key="'export-log-' + i"
              >
                Media: {{ logEntry }}
              </li>
            </ul>
            <p>You can find the {{ exportedFileType }} file in your downloads.</p>
          </template>
        </div>
        <export-warnings
          v-else
          :warnings="exportWarnings"
          action="export"
        ></export-warnings>
        <div v-if="hasExportedWpPosts">
          The WordPress posts in this Tapestry have also been exported. Find the .xml
          file in your downloads.
        </div>
      </b-alert>
      <b-alert v-else :show="hasExported" variant="danger" style="margin-top: 1em;">
        {{ apiError.error }}
      </b-alert>
    </div>
    <b-button
      block
      data-qa="export-tapestry-button"
      variant="primary"
      :disabled="isExporting"
      class="mt-3"
      @click="exportTapestry"
    >
      <b-spinner v-if="isExporting" small></b-spinner>
      <span :style="isExporting ? 'opacity: 50%;' : ''">
        Export
      </span>
      <span v-if="hasExported">again</span>
    </b-button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"
import ImportExportWarnings from "@/components/common/ImportExportWarnings"
import WordpressApi from "@/services/WordpressApi"

export default {
  name: "export-tapestry-button",
  components: {
    "export-warnings": ImportExportWarnings,
  },
  data() {
    return {
      shouldExportComments: true,
      isExporting: false,
      hasExported: false,
      hasExportedWpPosts: false,
      includeMedia: true,
      exportedFileType: "",
      exportWarnings: null,
      exportLog: { h5p: [], media: [] },
    }
  },
  computed: {
    ...mapState(["settings", "nodes", "apiError"]),
    tapestryHasWpNodes() {
      return Object.values(this.nodes).some(node => node.mediaType === "wp-post")
    },
  },
  methods: {
    ...mapActions(["getTapestryExport", "getTapestryExportAsZip"]),
    async exportTapestry() {
      this.hasExportedWpPosts = false
      this.hasExported = false
      this.exportWarnings = null
      this.exportLog = { h5p: [], media: [] }
      this.isExporting = true
      if (this.includeMedia) {
        await this.exportTapestryAsZip()
        this.exportedFileType = ".zip"
      } else {
        await this.exportTapestryAsJson()
        this.exportedFileType = ".json"
      }
      this.hasExported = true
      this.isExporting = false
    },
    async exportTapestryAsJson() {
      const exportedTapestry = await this.getTapestryExport(
        this.shouldExportComments
      )
      if (!exportedTapestry) return

      const exportId = exportedTapestry.exportId
      const blob = new Blob([JSON.stringify(exportedTapestry.json, null, 2)], {
        type: "application/json",
      })
      const fileUrl = URL.createObjectURL(blob)
      this.showFileDownload(fileUrl, `${this.settings.title}_${exportId}.json`)
      URL.revokeObjectURL(fileUrl)
    },
    async exportTapestryAsZip() {
      // Rebuild H5P cache before exporting to ensure H5P export files are up to date
      await WordpressApi.rebuildAllH5PCache()

      const exportedTapestry = await this.getTapestryExportAsZip(
        this.shouldExportComments
      )
      if (!exportedTapestry) return

      const exportId = exportedTapestry.exportId
      const fileUrl = exportedTapestry.zipUrl
      this.showFileDownload(fileUrl, `${this.settings.title}_${exportId}.zip`)

      if (exportedTapestry.wpPosts) {
        this.downloadWpPosts(exportedTapestry.wpPosts, exportId)
        this.hasExportedWpPosts = true
      }

      if (this.hasWarnings(exportedTapestry)) {
        this.exportWarnings = exportedTapestry.warnings
      }
      this.exportLog = exportedTapestry.log
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
