<template>
  <div>
    <b-alert
      dismissible
      class="mt-2 sticky-top"
      variant="danger"
      :show="!!apiError"
      @dismissed="apiError = null"
    >
      Error: {{ apiError }}
    </b-alert>
    <b-overlay :show="videosUploading" variant="white">
      <template #overlay>
        <div v-show="!isLatestTapestry" class="different-tapestry-notice">
          Please wait: videos are currently being uploaded from another Tapestry.
        </div>
      </template>
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
            aria-label="Select all videos"
            :checked="allVideosSelected"
            :disabled="videosUploading"
            @change="$event ? selectAllVideos() : clearSelected()"
          ></b-form-checkbox>
        </template>
        <template #cell(selected)="{rowSelected, selectRow, unselectRow, item}">
          <b-form-checkbox
            :aria-label="`Select node ${item.nodeID}, ${item.nodeTitle}`"
            :checked="rowSelected"
            :disabled="videosUploading || !item.withinSizeLimit"
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
        <b-form-checkbox v-model="useKalturaPlayer" :disabled="videosUploading">
          Switch uploaded videos to use Kaltura media player
        </b-form-checkbox>
      </b-form-group>
    </b-overlay>
    <b-button
      id="start-upload-button"
      block
      variant="light"
      :class="startButtonDisabled ? 'disabled' : ''"
      :disabled="startButtonDisabled"
      @click="startVideoUpload"
    >
      <b-spinner v-if="videosUploading && isLatestTapestry" small></b-spinner>
      <div :style="startButtonDisabled ? 'opacity: 50%;' : ''">
        Start Upload
      </div>
    </b-button>
    <b-button
      id="stop-upload-button"
      block
      variant="light"
      :class="stopButtonDisabled ? 'disabled' : ''"
      :disabled="stopButtonDisabled"
      @click="requestStopVideoUpload"
    >
      <div :style="stopButtonDisabled ? 'opacity: 50%;' : ''">
        Stop Upload
      </div>
    </b-button>
    <b-alert class="mt-3" :show="hasRequestedStop" variant="success">
      Successfully canceled the upload. Note: Videos already being processed will
      still be uploaded to Kaltura, but no more videos will be started. Please be
      patient as processing these videos could take some time.
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
import { data as wpData } from "@/services/wp"
import ErrorHelper from "@/utils/errorHelper"

export default {
  data() {
    return {
      videosUploading: false,
      uploadError: false,
      apiError: null,
      useKalturaPlayer: false,
      allVideos: [],
      selectedVideos: [],
      hasRequestedStop: false,
      latestTapestryID: "",
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
    isLatestTapestry() {
      return this.latestTapestryID === wpData.postId
    },
    startButtonDisabled() {
      return this.videosUploading || !this.canStartUpload
    },
    stopButtonDisabled() {
      return !this.videosUploading || !this.isLatestTapestry
    },
  },
  watch: {
    videosUploading(inProgress) {
      if (!inProgress) {
        this.refreshVideosToUpload()
      }
    },
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
    startVideoUpload() {
      this.videosUploading = true
      this.latestTapestryID = wpData.postId

      client
        .startKalturaUpload(
          this.selectedVideos.map(video => video.nodeID),
          this.useKalturaPlayer
        )
        .catch(error => {
          // Kaltura availability changed unexpectedly
          this.apiError = ErrorHelper.getErrorMessage(error)
        })

      this.$emit("upload-start")
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
    refreshVideosToUpload() {
      this.$refs.videoTable.refresh()
    },
    refresh() {
      client.getKalturaUploadStatus().then(data => {
        this.videosUploading = data.inProgress
        this.uploadError = data.error
        this.latestTapestryID = data.latestTapestryID
      })
    },
    async clearUploadError() {
      this.uploadError = false
      await client.clearKalturaUploadError()
    },
  },
}
</script>

<style lang="scss" scoped>
#start-upload-button {
  position: relative;
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
  }
}

#start-upload-button,
#stop-upload-button {
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}

.different-tapestry-notice {
  text-align: center;
  background: #fff;
  border-radius: 0.5em;
  padding: 1em;
  max-width: 500px;
}
</style>
