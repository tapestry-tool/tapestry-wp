<template>
  <b-form-group label="Post Name">
    <combobox
      v-model="mediaURL"
      data-qa="wp-combobox"
      item-text="title"
      item-value="id"
      :empty-message="emptyMessage"
      :options="wpPosts"
    >
      <template v-slot="slotProps">
        <code>{{ slotProps.option.id }}</code>
        <p v-html="slotProps.option.title"></p>
      </template>
    </combobox>
  </b-form-group>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import WordpressApi from "@/services/WordpressApi"

export default {
  components: {
    Combobox,
  },
  data() {
    return {
      wpPosts: [],
      emptyMessage: "Wordpress posts are loading...",
    }
  },
  computed: {
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.$store.commit("setCurrentEditingNodeProperty", {
          property: "typeData.mediaURL",
          value,
        })
      },
    },
  },
  mounted() {
    this.wpPosts = WordpressApi.loadCachedPosts()
    WordpressApi.getPosts()
      .then(posts => {
        this.wpPosts = posts
      })
      .then(() => {
        if (this.wpPosts.length < 1) {
          this.emptyMessage =
            "There are no Wordpress posts yet. Please add one in your WP dashboard."
        }
      })
  },
}
</script>
