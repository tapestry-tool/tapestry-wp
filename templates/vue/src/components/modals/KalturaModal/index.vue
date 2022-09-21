<template>
  <b-modal
    id="kaltura-modal"
    data-qa="kaltura-modal"
    :visible="show"
    size="lg"
    title="Kaltura Sync"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <div class="alert-wrapper">
        <b-alert
          dismissible
          class="mt-3"
          :show="!hasErrors && isUploading && isLatestTapestry"
          variant="primary"
        >
          Upload in progress... View the status of the current upload in the Log tab.
        </b-alert>
        <b-alert
          dismissible
          class="mt-3"
          :show="!hasErrors && uploadCompleted && isLatestTapestry"
          variant="success"
        >
          Upload completed. View details about the last upload in the Log tab.
        </b-alert>
        <b-alert
          dismissible
          class="mt-3"
          variant="danger"
          :show="!!apiError"
          @dismissed="apiError = null"
        >
          Error: {{ apiError }}
        </b-alert>
        <b-alert
          class="mt-3 mb-0"
          dismissible
          :show="uploadError && isLatestTapestry"
          variant="danger"
          @dismissed="clearUploadError"
        >
          <p>
            The upload did not complete due to an error in the server.
          </p>
          <p class="mb-1">
            If any videos are still Converting, to avoid re-uploading them, we
            recommend running
            <b>Clean Uploaded Videos</b>
            under the WordPress Settings > Tapestry.
          </p>
        </b-alert>
      </div>
      <b-tabs card>
        <b-tab
          title="Upload"
          :active="tab === 'upload'"
          @click="changeTab('upload')"
        >
          <kaltura-upload-tab
            :is-latest-tapestry="isLatestTapestry"
            :is-uploading="isUploading"
            @upload-start="handleUploadStart"
            @api-error="apiError = $event"
          />
        </b-tab>
        <b-tab title="Log" :active="tab === 'log'" @click="changeTab('log')">
          <kaltura-upload-log-tab ref="logTab" @refresh="refresh" />
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import client from "@/services/TapestryAPI"
import { data as wpData } from "@/services/wp"
import { names } from "@/config/routes"
import KalturaUploadTab from "./KalturaUploadTab"
import KalturaUploadLogTab from "./KalturaUploadLogTab"

export default {
  components: {
    KalturaUploadTab,
    KalturaUploadLogTab,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      refreshTimer: 0,

      isUploading: false,
      uploadError: false,
      latestTapestryID: "",
      uploadCompleted: false,
      apiError: null,
    }
  },
  computed: {
    hasErrors() {
      return !!this.apiError || (this.uploadError && this.isLatestTapestry)
    },
    isLatestTapestry() {
      return this.latestTapestryID === wpData.postId
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    hasErrors(hasErrors) {
      if (hasErrors) {
        this.uploadCompleted = false
      }
    },
    isUploading(isUploading) {
      this.uploadCompleted = !this.hasErrors && !isUploading
    },
    tab: {
      immediate: true,
      handler(requestedTab) {
        if (this.show) {
          const acceptedTabs = ["upload", "log"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.KALTURAMODAL,
              params: { nodeId: this.$route.params.nodeId, tab: "upload" },
              query: this.$route.query,
            })
          }
        }
      },
    },
    show: {
      immediate: true,
      handler(show) {
        if (show) {
          setTimeout(() => {
            this.refresh()
          }, 0)

          this.refreshTimer = setInterval(this.refresh, 15 * 1000)
        } else {
          this.cancelRefresh()
        }
      },
    },
  },
  beforeDestroy() {
    this.cancelRefresh()
  },
  methods: {
    closeModal() {
      this.$root.$emit("bv::hide::modal", "kaltura-modal")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.KALTURAMODAL,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
    cancelRefresh() {
      clearInterval(this.refreshTimer)
      this.refreshTimer = 0
    },
    handleUploadStart() {
      this.isUploading = true
      this.latestTapestryID = wpData.postId
      this.uploadError = false
      this.apiError = null

      setTimeout(this.refresh, 1000)
    },
    refresh() {
      client.getKalturaUploadStatus().then(data => {
        this.isUploading = data.inProgress
        this.uploadError = data.error
        this.latestTapestryID = data.latestTapestryID
      })

      this.$refs.logTab.refresh()
    },
    async clearUploadError() {
      this.uploadError = false
      await client.clearKalturaUploadError()
    },
  },
}
</script>

<style lang="scss" scoped>
.alert-wrapper {
  position: sticky;
  z-index: 2;
  top: 0;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 0.5rem;
}
</style>
