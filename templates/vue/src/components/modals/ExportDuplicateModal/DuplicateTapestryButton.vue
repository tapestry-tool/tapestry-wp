<template>
  <div>
    <b-form-text class="mt-2">
      Create a duplicate copy of this tapestry on this site.
    </b-form-text>
    <b-alert :show="showConfirmation" variant="success">
      Your new Tapestry is ready! Click on the link below to view it.
      <br />
      <a data-qa="duplicate-tapestry-link" :href="link" target="_blank">
        {{ link }}
      </a>
    </b-alert>
    <b-button
      block
      data-qa="duplicate-tapestry-button"
      variant="primary"
      class="mt-3"
      @click="duplicateTapestry"
    >
      <b-spinner v-if="loading" small data-qa="spinner"></b-spinner>
      <span :style="loading ? 'opacity: 50%;' : ''">Duplicate on this site</span>
    </b-button>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import client from "@/services/TapestryAPI"

export default {
  name: "duplicate-tapestry-button",
  data() {
    return {
      showConfirmation: false,
      link: null,
      loading: false,
    }
  },
  computed: {
    ...mapGetters(["tapestryJson"]),
    ...mapState(["settings"]),
  },
  methods: {
    duplicateTapestry() {
      this.loading = true
      const tapestry = this.tapestryJson
      client
        .addTapestry({ title: this.settings.title, ...tapestry })
        .then(res => {
          const href = res.settings.permalink
          this.link = href
          this.showConfirmation = true
        })
        .finally(() => {
          this.loading = false
        })
        .catch(err => {
          console.log(err)
        })
    },
  },
}
</script>
