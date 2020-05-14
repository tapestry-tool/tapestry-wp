<template>
  <div ref="container">
    <h4>Your Favourite Topics</h4>
    <div v-for="node in favouriteNodes" :key="node.id">
      <h4>{{ node.title }}</h4>
      <tapestry-media
        :node-id="node.id"
        :allow-end-screen="false"
        :autoplay="false"
        :dimensions="dimensions"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import TapestryMedia from "@/components/TapestryMedia"

export default {
  name: "tyde-favourites",
  components: {
    TapestryMedia,
  },
  data() {
    return {
      isMounted: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    ...mapState(["favourites"]),
    favouriteNodes() {
      return this.favourites.map(this.getNode)
    },
    dimensions() {
      if (!this.isMounted) {
        return {}
      }
      const { width, height } = this.$refs.container.getBoundingClientRect()
      return {
        width,
        height,
      }
    },
  },
  mounted() {
    this.isMounted = true
  },
}
</script>
