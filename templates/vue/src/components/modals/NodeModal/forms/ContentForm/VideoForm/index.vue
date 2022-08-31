<template>
  <div>
    <mp4-form v-if="mediaFormat === 'mp4'"></mp4-form>
    <youtube-form v-else-if="mediaFormat === 'youtube'"></youtube-form>
    <kaltura-form v-else-if="mediaFormat === 'kaltura'"></kaltura-form>
  </div>
</template>

<script>
import Mp4Form from "./Mp4Form"
import YoutubeForm from "./YoutubeForm"
import KalturaForm from "./KalturaForm"
import { mapState } from "vuex"

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
  },
}
</script>
