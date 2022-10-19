<template>
  <div>
    <b-overlay :show="isUploading" variant="white">
      <template #overlay>
        <div v-show="!isLatestTapestry" class="different-tapestry-notice">
          Please wait: videos are currently being uploaded from another Tapestry.
        </div>
      </template>
      <div>Upload Videos to Kaltura</div>
      <b-form-text>
        Select videos in this Tapestry that you would like to upload to Kaltura. Only
        videos added as file uploads can be uploaded. Once a video is successfully
        uploaded to Kaltura, it will be deleted locally to save server space.
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
            :disabled="isUploading"
            @change="$event ? selectAllVideos() : clearSelected()"
          ></b-form-checkbox>
        </template>
        <template #cell(selected)="{rowSelected, selectRow, unselectRow, item}">
          <b-form-checkbox
            :aria-label="`Select node ${item.nodeID}, ${item.nodeTitle}`"
            :checked="rowSelected"
            :disabled="isUploading || !item.withinSizeLimit"
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
      <b-form-group
        description="Your videos can keep using a basic HTML5 video player if you
          uncheck this, but the basic player does not provide features such as
          captions, quality, and bandwidth adjustments."
      >
        <b-form-checkbox v-model="useKalturaPlayer" :disabled="isUploading">
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
      <b-spinner v-if="isUploading && isLatestTapestry" small></b-spinner>
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
      @click="$emit('request-stop')"
    >
      <div :style="stopButtonDisabled ? 'opacity: 50%;' : ''">
        Stop Upload
      </div>
    </b-button>
  </div>
</template>

<script>
import KalturaAPI from "@/services/KalturaAPI"
import ErrorHelper from "@/utils/errorHelper"

export default {
  props: {
    isLatestTapestry: {
      type: Boolean,
      required: true,
    },
    isUploading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      useKalturaPlayer: true,
      allVideos: [],
      selectedVideos: [],
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
    startButtonDisabled() {
      return this.isUploading || !this.canStartUpload
    },
    stopButtonDisabled() {
      return !this.isUploading || !this.isLatestTapestry
    },
  },
  watch: {
    isUploading(isUploading) {
      if (!isUploading) {
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
      KalturaAPI.uploadVideos(
        this.selectedVideos.map(video => video.nodeID),
        this.useKalturaPlayer
      ).catch(error => {
        // Kaltura availability changed unexpectedly
        this.$emit("api-error", ErrorHelper.getErrorMessage(error))
      })

      this.$emit("upload-start")
    },
    getVideosToUpload(ctx, callback) {
      KalturaAPI.getVideosToUpload()
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
