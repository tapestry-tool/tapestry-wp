<template>
  <b-row>
    <b-col>
      <b-form-group label="Video URL">
        <b-form-input
          id="node-video-youtube-url"
          v-model="mediaURL"
          data-qa="node-video-youtube-url"
          placeholder="Enter URL for YouTube video"
          required
        />
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import { mapMutations } from "vuex"
import Helpers from "@/utils/Helpers"

export default {
  computed: {
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.update("typeData.mediaURL", value)
      },
    },
    youtubeId() {
      return Helpers.getYoutubeID(this.mediaURL)
    },
  },
  watch: {
    youtubeId(id) {
      this.update("typeData.youtubeID", id)
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
  },
}
</script>
