<template>
  <b-form-group label="Post Name">
    <combobox
      v-model="node.typeData.mediaURL"
      item-text="title"
      item-value="id"
      :empty-message="emptyMessage"
      :options="wpPosts"
    >
      <template v-slot="slotProps">
        <p>
          <code>{{ slotProps.option.id }}</code>
          {{ slotProps.option.title }}
        </p>
      </template>
    </combobox>
  </b-form-group>
</template>

<script>
import Combobox from "@/components/Combobox"
import WordpressApi from "@/services/WordpressApi"

export default {
  components: {
    Combobox,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      wpPosts: [],
      emptyMessage: "Wordpress posts are loading...",
    }
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
