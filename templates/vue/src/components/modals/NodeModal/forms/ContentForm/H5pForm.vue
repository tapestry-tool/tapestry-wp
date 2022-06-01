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
    <b-form-group v-if="selectedH5p.library == 'H5P.ThreeImage'" label="Scene">
      <combobox
        v-model="scene"
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
import { data } from "@/services/wp"
import { mapMutations, mapState } from "vuex"

export default {
  components: {
    Combobox,
  },
  data() {
    return {
      selectedId: null,
      options: [],
    }
  },
  computed: {
    ...mapState({
      stateMediaURL: state => state.currentEditingNode.typeData.mediaURL,
    }),
    scene: {
      get() {
        return this.$store.state.currentEditingNode.typeData.scene
      },
      set(value) {
        this.update("typeData.scene", value)
      },
    },
    mediaUrl() {
      return `${data.adminAjaxUrl}?action=h5p_embed&id=${this.selectedId}`
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
      this.update("typeData.mediaURL", val)
    },
    selectedH5p(val) {
      this.update("typeData.h5pMeta", val)
    },
  },
  mounted() {
    H5PApi.getAllContent().then(options => {
      this.options = options
      const id = this.stateMediaURL.split("&id=")[1]
      const defaultValue = options.find(content => {
        return content.id == id
      })
      if (defaultValue) {
        this.selectedId = defaultValue.id
      }
    })
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
  },
}
</script>
