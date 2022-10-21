<template>
  <b-overlay :show="disableFields">
    <template #overlay>
      <div class="no-kaltura-notice">
        This information cannot be edited because Kaltura is not available on the
        server.
      </div>
    </template>
    <div :aria-hidden="disableFields">
      <mp4-form v-if="mediaFormat === 'mp4'"></mp4-form>
      <youtube-form v-else-if="mediaFormat === 'youtube'"></youtube-form>
      <kaltura-form
        v-else-if="mediaFormat === 'kaltura'"
        :disable-fields="disableFields"
      ></kaltura-form>
    </div>
  </b-overlay>
</template>

<script>
import Mp4Form from "./Mp4Form"
import YoutubeForm from "./YoutubeForm"
import KalturaForm from "./KalturaForm"
import { mapState } from "vuex"
import * as wp from "@/services/wp"

export default {
  components: {
    Mp4Form,
    YoutubeForm,
    KalturaForm,
  },
  computed: {
    ...mapState({
      mediaFormat: state => state.currentEditingNode.mediaFormat,
    }),
    kalturaAvailable() {
      return wp.getKalturaStatus()
    },
    disableFields() {
      return this.mediaFormat === "kaltura" && !this.kalturaAvailable
    },
  },
}
</script>

<style lang="scss" scoped>
.no-kaltura-notice {
  text-align: center;
  background: #fff;
  border-radius: 0.5em;
  padding: 1em;
  max-width: 500px;
}
</style>
