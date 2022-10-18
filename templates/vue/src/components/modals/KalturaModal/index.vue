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
          class="my-1"
          :show="!hasErrors && isUploading && isLatestTapestry"
          variant="primary"
        >
          Upload in progress... View the status of the current upload in the Log tab.
        </b-alert>
        <b-alert class="my-1" :show="hasRequestedStop" variant="success">
          Successfully canceled the upload. Note: Videos already being processed will
          still be uploaded to Kaltura, but no more videos will be started. Please be
          patient as processing these videos could take some time.
        </b-alert>
        <b-alert
          dismissible
          class="my-1"
          :show="!hasErrors && latestUploadCount.total !== 0"
          variant="success"
        >
          Successfully uploaded {{ latestUploadCount.success }}
          {{ latestUploadCount.success > 1 ? "videos" : "video" }}. View details
          about the last upload in the Log tab.
        </b-alert>
        <b-alert
          dismissible
          class="my-1"
          variant="danger"
          :show="!!apiError"
          @dismissed="apiError = null"
        >
          Error: {{ apiError }}
        </b-alert>
        <b-alert
          class="my-1"
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
        <b-alert
          class="my-1"
          dismissible
          :show="latestUploadCount.error !== 0"
          variant="danger"
        >
          {{ latestUploadCount.error }} out of {{ latestUploadCount.total }}
          {{ latestUploadCount.total > 1 ? "videos" : "video" }}
          failed to upload. View details in the Log tab.
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
            @request-stop="requestStopVideoUpload"
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
import KalturaAPI from "@/services/KalturaAPI"
import { data as wpData } from "@/services/wp"
import { names } from "@/config/routes"
import KalturaUploadTab from "./KalturaUploadTab"
import KalturaUploadLogTab from "./KalturaUploadLogTab"
import { mapActions, mapMutations, mapState } from "vuex"

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
      apiError: null,
      hasRequestedStop: false,

      latestUploadCount: {
        total: 0,
        success: 0,
        error: 0,
      },
    }
  },
  computed: {
    ...mapState(["notifications"]),
    hasErrors() {
      return (
        !!this.apiError ||
        (this.uploadError && this.isLatestTapestry) ||
        this.latestUploadCount.error !== 0
      )
    },
    isLatestTapestry() {
      return this.latestTapestryID === wpData.postId
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
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

          if (this.refreshTimer !== 0) {
            clearInterval(this.refreshTimer)
          }
          this.refreshTimer = setInterval(this.refresh, 15 * 1000)
        } else {
          this.latestUploadCount = {
            total: 0,
            success: 0,
            error: 0,
          }
          if (!this.isUploading || !this.isLatestTapestry) {
            this.cancelRefresh()
          }
        }
      },
    },
  },
  beforeDestroy() {
    this.cancelRefresh()
  },
  methods: {
    ...mapActions(["getNotifications", "updateNotifications"]),
    ...mapMutations(["setNotifications"]),
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
      this.hasRequestedStop = false
      this.latestUploadCount = {
        total: 0,
        success: 0,
        error: 0,
      }

      setTimeout(this.refresh, 1000)
    },
    refresh() {
      Promise.all([KalturaAPI.getUploadStatus(), client.getNotifications()]).then(
        ([status, notifications]) => {
          this.isUploading = status.inProgress
          this.uploadError = status.error
          this.latestTapestryID = status.latestTapestryID

          if (notifications.kaltura.total !== 0) {
            this.latestUploadCount = notifications.kaltura

            if (this.show) {
              this.clearKalturaNotifications()
            }
          }
          if (!this.show || notifications.kaltura.total === 0) {
            this.setNotifications(notifications)
          }
        }
      )

      this.$refs.logTab?.refresh()
    },
    clearKalturaNotifications() {
      this.updateNotifications({
        kaltura: {
          total: 0,
          success: 0,
          error: 0,
        },
      })
    },
    async requestStopVideoUpload() {
      await KalturaAPI.stopUpload()
      this.hasRequestedStop = true
      setTimeout(() => {
        this.hasRequestedStop = false
      }, 10 * 1000)
    },
    async clearUploadError() {
      this.uploadError = false
      await KalturaAPI.clearUploadError()
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
  display: flex; // so that margins from children don't collapse
  flex-direction: column;
}
</style>
