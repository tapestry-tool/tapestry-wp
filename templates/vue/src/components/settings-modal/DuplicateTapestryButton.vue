<template>
  <div>
    <b-button @click="duplicateTapestry">Duplicate Tapestry</b-button>
    <div v-if="showConfirmation">
      <p>Your new Tapestry is ready! Click on the link below to view it.</p>
      <a :href="link" target="_blank">{{ link }}</a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryApi from "@/services/TapestryAPI"

const client = new TapestryApi(wpPostId)

export default {
  name: "duplicate-tapestry-button",
  data() {
    return {
      showConfirmation: false,
      link: null,
    }
  },
  computed: {
    ...mapGetters(["settings", "tapestryJson"]),
  },
  methods: {
    duplicateTapestry() {
      const tapestry = this.tapestryJson
      client.addTapestry({ title: this.settings.title, ...tapestry }).then(res => {
        const href = `${location.origin}/tapestry/${res.settings.tapestrySlug}`
        this.link = href
        this.showConfirmation = true
      })
    },
  },
}
</script>
