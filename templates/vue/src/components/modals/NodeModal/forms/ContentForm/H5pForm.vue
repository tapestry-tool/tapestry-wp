<template>
  <div>
    <b-form-group :label="h5pLabel">
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
      <b-form-text v-if="showVideoDescription">
        This H5P should not include any screenshots of the stage layout.
      </b-form-text>
    </b-form-group>
    <b-form-group v-if="selectedH5p.library == 'H5P.ThreeImage'" label="Scene">
      <combobox
        v-model="node.typeData.scene"
        item-text="scenename"
        item-value="sceneId"
        empty-message="There are no scenes in this H5P 360. Please double-check you have scenes set up in your H5P Virtual Tour (360) content."
        :options="scenes"
      >
        <template v-slot="{ option }">
          <p>
            <code>{{ option.sceneId }}</code>
            {{ option.scenename }}
          </p>
        </template>
      </combobox>
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import H5PApi from "@/services/H5PApi"
import { tydeTypes } from "@/utils/constants"
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
    h5pLabel() {
      const labels = {
        [tydeTypes.STAGE]: "Pre-Stage H5P Content",
        [tydeTypes.MODULE]: "Module Completion H5P Content",
      }
      return labels[this.node.tydeType] || "H5P Content"
    },
    mediaUrl() {
      return `${data.adminAjaxUrl}?action=h5p_embed&id=${this.selectedId}`
    },
    showVideoDescription() {
      return (
        this.node.tydeType === tydeTypes.STAGE ||
        this.node.tydeType === tydeTypes.MODULE
      )
    },
    selectedH5p() {
      const selectedId = this.selectedId
      if (selectedId) {
        const selectedValue = this.options.find(content => {
          return content.id == selectedId
        })
        return selectedValue
      }
      return { library: null }
    },
    scenes() {
      return this.selectedH5p.details.threeImage.scenes
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
