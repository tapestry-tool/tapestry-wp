<template>
  <div>
    <b-form-group label="H5P Content">
      <combobox
        v-model="selectedId"
        item-text="title"
        item-value="id"
        empty-message="There's no H5P content yet. Please add one in your WP dashboard."
        :options="options"
        data-qa="h5p-content-select"
      >
        <template v-slot="{ option }">
          <p>
            <code>{{ option.id }}</code>
            {{ option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import H5PApi from "@/services/H5PApi"
import { data } from "@/services/wp"

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
      selectedId: null,
      options: [],
    }
  },
  computed: {
    mediaUrl() {
      return `${data.adminAjaxUrl}?action=h5p_embed&id=${this.selectedId}`
    },
  },
  watch: {
    mediaUrl(val) {
      this.node.typeData.mediaURL = val
    },
  },
  mounted() {
    H5PApi.getAllContent().then(options => {
      this.options = options
      const defaultValue = options.find(content => {
        const id = this.node.typeData.mediaURL.split("&id=")[1]
        return content.id == id
      })
      if (defaultValue) {
        this.selectedId = defaultValue.id
      }
    })
  },
}
</script>
