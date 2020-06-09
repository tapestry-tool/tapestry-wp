<template>
  <div>
    <b-form-group label="H5P Content">
      <combobox
        v-model="selectedId"
        item-text="title"
        item-value="id"
        empty-message="There's no H5P content yet. Please add one in your WP dashboard."
        :options="options"
      >
        <template v-slot="{ option }">
          <p>
            <code>{{ option.id }}</code>
            {{ option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      label="H5P Video Duration"
      description="This only applies to video H5P content"
    >
      <b-form-input
        id="node-h5p-media-duration"
        v-model="node.mediaDuration"
        data-testid="node-h5pDuration"
        placeholder="Enter duration (in seconds)"
        required
      />
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/Combobox"
import H5PApi from "@/services/H5PApi"

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
      return `${wpData.adminAjaxUrl}?action=h5p_embed&id=${this.selectedId}`
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
