<template>
  <div>
    <b-overlay :show="videosUploading" variant="white">
      <template #overlay><div></div></template>
      <div>Upload Videos to Kaltura</div>
      <b-form-text>
        Select videos in this Tapestry that you would like to upload to Kaltura. Only
        videos added as file uploads can be uploaded.
      </b-form-text>
      <b-table
        ref="videoTable"
        v-model="allVideos"
        class="my-3"
        selectable
        no-select-on-click
        show-empty
        empty-text="There are no videos to upload in this Tapestry."
        selected-variant=""
        primary-key="nodeID"
        :fields="['selected', 'nodeID', 'nodeTitle']"
        :items="getVideosToUpload"
        @row-selected="handleVideoSelected"
      >
        <template #head(selected)="{clearSelected}">
          <b-form-checkbox
            :checked="allVideosSelected"
            @change="$event ? selectAllVideos() : clearSelected()"
          ></b-form-checkbox>
        </template>
        <template #cell(selected)="{rowSelected, selectRow, unselectRow, item}">
          <b-form-checkbox
            :checked="rowSelected"
            :disabled="!item.withinSizeLimit"
            class="d-inline"
            @change="$event ? selectRow() : unselectRow()"
          ></b-form-checkbox>
          <i
            v-if="!item.withinSizeLimit"
            :id="`video-select-info-${item.nodeID}`"
            class="far fa-question-circle"
          ></i>
          <b-tooltip
            v-if="!item.withinSizeLimit"
            :target="`video-select-info-${item.nodeID}`"
            triggers="hover"
          >
            This video is too big to be uploaded to Kaltura.
          </b-tooltip>
        </template>
      </b-table>
      <b-form-group>
        <b-form-checkbox v-model="useKalturaPlayer">
          Switch uploaded videos to use Kaltura media player
        </b-form-checkbox>
      </b-form-group>
    </b-overlay>
    <b-button
      id="start-upload-button"
      block
      variant="light"
      :class="videosUploading ? 'disabled' : ''"
      :disabled="videosUploading || !canStartUpload"
      @click="startVideoUpload"
    >
      <b-spinner v-if="videosUploading" small></b-spinner>
      <div :style="videosUploading || !canStartUpload ? 'opacity: 50%;' : ''">
        Start Upload
      </div>
    </b-button>
    <b-button
      id="stop-upload-button"
      block
      variant="light"
      :class="!videosUploading ? 'disabled' : ''"
      :disabled="!videosUploading"
      @click="requestStopVideoUpload"
    >
      <div :style="!videosUploading ? 'opacity: 50%;' : ''">
        Stop Upload
      </div>
    </b-button>
    <b-alert class="mt-2" :show="hasRequestedStop" variant="success">
      Successfully canceled the upload. Note: Videos already being processed will
      still be uploaded to Kaltura, but no more videos will be started. Please be
      patient as processing these videos could take some time.
    </b-alert>
    <div class="mt-3">Upload Log</div>
    <b-form-text>
      Automatically refreshes every 15 seconds; you can also manually refresh.
      <br />
      Once the upload has completed, please reload the page to see the updated node
      content.
    </b-form-text>
    <div class="my-3 d-flex flex-row align-items-center">
      <b-form-select v-model="perPage" class="per-page-select mr-2">
        <b-form-select-option :value="10">10 per page</b-form-select-option>
        <b-form-select-option :value="25">25 per page</b-form-select-option>
        <b-form-select-option :value="50">50 per page</b-form-select-option>
        <b-form-select-option :value="100">100 per page</b-form-select-option>
        <b-form-select-option :value="0">Show all entries</b-form-select-option>
      </b-form-select>
      <b-pagination
        v-model="currentPage"
        class="mb-0"
        aria-controls="upload-log-table"
        :total-rows="uploadLogLength"
        :per-page="perPage"
      ></b-pagination>
      <b-button size="sm" class="ml-auto" @click="refreshVideoUploadStatus">
        Refresh
      </b-button>
    </div>
    <b-table
      id="upload-log-table"
      ref="uploadStatusTable"
      responsive
      striped
      show-empty
      empty-text="No videos were uploaded from this Tapestry."
      :fields="[
        {
          key: 'uploadTime',
          class: 'align-top',
        },
        {
          key: 'nodeID',
          class: 'align-top',
        },
        {
          key: 'nodeTitle',
          class: 'align-top',
        },
        {
          key: 'uploadStatus',
          class: 'align-top',
        },
        {
          key: 'kalturaID',
          class: 'align-top',
        },
        {
          key: 'additionalInfo',
          class: 'align-top',
        },
      ]"
      :items="getVideoUploadStatus"
      :current-page="currentPage"
      :per-page="perPage"
    ></b-table>
    <b-alert :show="!!uploadError" variant="danger">
      <p>
        The upload did not complete due to an error in the server: "{{
          uploadError
        }}".
      </p>
      <p class="mb-1">
        If any videos are still Converting, to avoid re-uploading them, we recommend
        running
        <b>Clean Uploaded Videos</b>
        under the WordPress Settings > Tapestry.
      </p>
    </b-alert>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

export default {
  name: "kaltura-upload-tab",
  data() {
    return {
      videosUploading: false,
      uploadError: null,
      useKalturaPlayer: false,
      allVideos: [],
      selectedVideos: [],
      uploadStatusRefreshTimer: 0,
      hasRequestedStop: false,
      uploadLogLength: 0,
      currentPage: 1,
      perPage: 10,
    }
  },
  computed: {
    allVideosSelected() {
      return (
        this.allUploadableVideos.length === this.selectedVideos.length &&
        this.allUploadableVideos.length > 0
      )
    },
    allUploadableVideos() {
      return this.allVideos.filter(video => video.withinSizeLimit)
    },
    canStartUpload() {
      return this.selectedVideos.length > 0
    },
  },
  watch: {
    videosUploading(inProgress) {
      if (!inProgress) {
        this.refreshVideosToUpload()
      }
    },
  },
  mounted() {
    this.uploadStatusRefreshTimer = setInterval(
      this.refreshVideoUploadStatus,
      15 * 1000
    )
    this.refreshVideoUploadStatus()
  },
  beforeDestroy() {
    this.cancelUploadStatusRefresh()
  },
  methods: {
    selectAllVideos() {
      for (let i = 0; i < this.allVideos.length; i++) {
        if (this.allVideos[i].withinSizeLimit) {
          this.$refs.videoTable.selectRow(i)
        }
      }
    },
    handleVideoSelected(rows) {
      this.selectedVideos = rows
    },
    cancelUploadStatusRefresh() {
      clearInterval(this.uploadStatusRefreshTimer)
      this.uploadStatusRefreshTimer = 0
    },
    startVideoUpload() {
      this.videosUploading = true
      client.startKalturaUpload(this.selectedVideos, this.useKalturaPlayer)

      setTimeout(this.refreshVideoUploadStatus, 500)
    },
    async requestStopVideoUpload() {
      await client.requestStopKalturaUpload()
      this.hasRequestedStop = true
      setTimeout(() => {
        this.hasRequestedStop = false
      }, 10 * 1000)
    },
    getVideosToUpload(ctx, callback) {
      client
        .getVideosToUpload()
        .then(data => {
          callback(data)
        })
        .catch(() => {
          callback([])
        })

      return null
    },
    getVideoUploadStatus(ctx, callback) {
      client
        .getKalturaUploadStatus(ctx.currentPage, ctx.perPage)
        .then(data => {
          callback(data.videos)
          this.uploadLogLength = data.totalCount
          this.videosUploading = data.inProgress
          this.uploadError = data.error
        })
        .catch(() => {
          callback([])
        })

      return null
    },
    refreshVideosToUpload() {
      this.$refs.videoTable.refresh()
    },
    refreshVideoUploadStatus() {
      this.$refs.uploadStatusTable.refresh()
    },
  },
}
</script>

<style lang="scss" scoped>
.per-page-select {
  width: inherit !important;
}
</style>
