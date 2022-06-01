<template>
  <div id="modal-appearance">
    <h6 class="mb-3">Node Appearance</h6>
    <b-card class="px-3 pt-3" bg-variant="light" no-body>
      <b-container fluid class="bv-example-row">
        <b-row>
          <b-col lg class="pl-0">
            <h6 class="mb-3">Node Background</h6>
            <color-picker
              label="Background color"
              :currentColor="node.backgroundColor"
              :data-qa="`node-backgroundcolor-${node.id}`"
              @change="update('backgroundColor', $event)"
            />
            <b-form-group>
              <b-form-checkbox
                v-model="addThumbnail"
                data-qa="node-appearance-thumbnail"
              >
                Background image
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="addThumbnail">
              <file-upload
                :value="node.imageURL"
                input-test-id="node-appearance-thumbnail-url"
                :show-url-upload="false"
                thumbnail-type="thumbnail"
                :show-image-preview="true"
                file-types="image/*"
                @input="update('imageURL', $event)"
                @isUploading="handleUploadChange"
              />
            </b-form-group>
            <b-form-group v-if="addThumbnail || addLockedThumbnail">
              <b-form-checkbox
                v-model="addLockedThumbnail"
                data-qa="node-appearance-lockedThumbnail"
              >
                Show a different background when locked
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="addLockedThumbnail">
              <file-upload
                :value="node.lockedImageURL"
                input-test-id="node-appearance-lockedThumbnail-url"
                :show-url-upload="false"
                thumbnail-type="locked"
                :show-image-preview="true"
                file-types="image/*"
                @input="update('lockedImageURL', $event)"
                @isUploading="handleUploadChange"
              />
            </b-form-group>
          </b-col>
          <b-col lg class="pr-0">
            <h6 class="mb-3">Node Title</h6>
            <color-picker
              label="Text color"
              :currentColor="node.textColor"
              :data-qa="`node-textcolor-${node.id}`"
              @change="update('textColor', $event)"
            />
            <b-form-group>
              <b-form-checkbox
                :checked="node.hideTitle"
                data-qa="node-appearance-title"
                @input="update('hideTitle', $event)"
              >
                Hide title
              </b-form-checkbox>
            </b-form-group>
            <b-badge
              v-if="!node.imageURL"
              class="readability-badge"
              :variant="readabilityVariant"
            >
              Readability: {{ readability }}%
            </b-badge>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg class="pl-0">
            <h6 class="mb-3">Other</h6>
            <b-form-group>
              <b-form-checkbox
                :checked="node.hideProgress"
                data-qa="node-appearance-progress"
                @input="update('hideProgress', $event)"
              >
                Hide progress bar
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox
                :checked="node.hideMedia"
                data-qa="node-appearance-media"
                @input="update('hideMedia', $event)"
              >
                Hide media button
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-card>
    <h6 class="mt-4 mb-3">Content Appearance</h6>
    <b-card class="px-3 pt-3" bg-variant="light" no-body>
      <b-form-group>
        <b-form-checkbox
          :checked="node.fullscreen"
          data-qa="node-behaviour-fullscreen"
          @input="handleFullscreenChange"
        >
          Open content in fullscreen
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="node.presentationStyle === 'page'">
        <b-form-checkbox
          :checked="
            node.typeData.hasOwnProperty('showNavBar')
              ? node.typeData.showNavBar
              : true
          "
          data-qa="nav-checkbox"
          @change="update('typeData.showNavBar', $event)"
        >
          Add navigation bar
        </b-form-checkbox>
      </b-form-group>
      <b-form-group
        v-if="
          node.fullscreen && (node.mediaType === 'video' || node.mediaType === 'h5p')
        "
        class="indented-options"
      >
        <b-form-radio
          :checked="node.fitWindow"
          name="fit-window"
          :value="true"
          @input="update('fitWindow', $event)"
        >
          Fit whole video in window
        </b-form-radio>
        <b-form-radio
          :checked="node.fitWindow"
          name="fit-window"
          :value="false"
          @input="update('fitWindow', $event)"
        >
          Crop video to fill window (not recommended)
        </b-form-radio>
      </b-form-group>
      <b-form-group v-if="isPageChild">
        <b-form-checkbox
          :checked="node.typeData.halfWidth"
          data-qa="page-child-node-behaviour-half-width"
          @input="update('typeData.halfWidth', $event)"
        >
          Show this node as half width
        </b-form-checkbox>
      </b-form-group>
    </b-card>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import ColorPicker from "@/components/modals/common/ColorPicker"
import TinyColor from "tinycolor2"
import { mapMutations, mapState } from "vuex"

export default {
  components: {
    FileUpload,
    ColorPicker,
  },
  props: {
    isPageChild: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      addThumbnail: false,
      addLockedThumbnail: false,
    }
  },
  computed: {
    ...mapState({
      node: "currentEditingNode",
    }),
    readability() {
      return Math.round(
        (Math.log(
          TinyColor.readability(this.node.textColor, this.node.backgroundColor)
        ) /
          Math.log(21)) *
          100
      )
    },
    readabilityVariant() {
      if (this.readability < 20) {
        return "danger"
      }
      if (this.readability < 40) {
        return "warning"
      }
      return "success"
    },
  },
  watch: {
    addThumbnail(addThumbnail) {
      if (!addThumbnail) {
        this.update("imageURL", "")
        this.update("thumbnailFileId", "")
      }
    },
    addLockedThumbnail(addLockedThumbnail) {
      if (!addLockedThumbnail) {
        this.update("lockedImageURL", "")
        this.update("lockedThumbnailFileId", "")
      }
    },
  },
  created() {
    this.addThumbnail = this.node.imageURL && this.node.imageURL.length > 0
    this.addLockedThumbnail =
      this.node.lockedImageURL && this.node.lockedImageURL.length > 0
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    handleFullscreenChange(value) {
      this.update("fullscreen", value)
      this.update("fitWindow", true)
    },
  },
}
</script>

<style lang="scss" scoped>
.readability-badge {
  font-size: 0.9em;
  font-weight: normal;
  margin-bottom: 1em;
}
</style>
