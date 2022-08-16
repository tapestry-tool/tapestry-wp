<template>
  <b-card
    :bg-variant="isPending ? 'danger' : 'secondary'"
    text-variant="light"
    class="mt-2"
    data-qa="caption-row"
  >
    <b-row align-v="center" class="mb-2 mx-0">
      <div :id="`${captionContainerId}-toggle`" v-b-toggle="captionContainerId">
        <b>{{ title }}</b>
        <span v-if="isDefault" class="ml-2">
          (default)
        </span>
        <span v-if="isPending && errorMessage" class="ml-2">
          <i
            :id="`caption-error-message-${caption.id}`"
            class="far fa-question-circle"
            tabindex="0"
          ></i>
          <b-tooltip :target="`caption-error-message-${caption.id}`">
            This caption could not be uploaded. {{ errorMessage }}
          </b-tooltip>
        </span>
      </div>
      <div class="ml-auto d-flex align-items-center">
        <b-form-checkbox
          v-model="caption.displayOnPlayer"
          switch
          :data-qa="`caption-display-toggle-${index}`"
          class="mr-3"
        >
          Display in player
        </b-form-checkbox>
        <b-button
          class="mr-1"
          size="sm"
          :variant="isRemovable ? 'danger' : 'light'"
          :disabled="!isRemovable"
          @click="$emit('remove')"
        >
          Delete
        </b-button>
        <b-button
          v-if="isPending"
          size="sm"
          variant="primary"
          @click="$emit('move')"
        >
          Add back
        </b-button>
        <b-button
          v-else
          size="sm"
          variant="primary"
          :disabled="isDefault"
          :data-qa="`caption-set-default-button-${index}`"
          @click="$emit('setDefault', caption.id)"
        >
          Set as default
        </b-button>
      </div>
    </b-row>
    <b-collapse :id="captionContainerId" visible>
      <b-card bg-variant="light" text-variant="dark">
        <b-row>
          <b-col cols="6">
            <b-form-group label="Source">
              <file-upload
                v-model="caption.captionUrl"
                file-types=".vtt"
                compact-mode
                placeholder="Enter URL or upload a VTT file"
                :is-image="false"
                :file-upload-id="
                  `caption-file-upload-${isPending ? 'pending' : ''}-${caption.id}`
                "
              />
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group label="Language">
              <b-form-select
                v-model="caption.language"
                :data-qa="`caption-language-${index}`"
                :options="languages"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-checkbox
              switch
              :checked="customizeLabel"
              :data-qa="`caption-label-toggle-${index}`"
              @change="handleCustomizeLabel($event)"
            >
              Customize label
            </b-form-checkbox>
            <b-form-input
              v-if="customizeLabel"
              v-model="caption.label"
              class="mt-2"
              aria-label="Caption label"
              :placeholder="caption.language"
              :data-qa="`caption-label-${index}`"
            />
          </b-col>
        </b-row>
      </b-card>
    </b-collapse>
  </b-card>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"

export default {
  components: {
    FileUpload,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
    },
    isRemovable: {
      type: Boolean,
      required: false,
      default: true,
    },
    languages: {
      type: Array,
      required: true,
    },
    errorMessage: {
      type: String,
      required: false,
      default: "",
    },
    isPending: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    caption: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit("input", val)
      },
    },
    captionContainerId() {
      return `caption${this.isPending ? "-pending" : ""}-${this.index}-container`
    },
    customizeLabel: {
      get() {
        return this.caption.label !== undefined
      },
      set(val) {
        if (val) {
          this.caption.label = ""
        } else {
          this.caption.label = undefined
        }
      },
    },
    title() {
      return this.isPending ? "Pending Caption" : `Caption ${this.index + 1}`
    },
  },
  methods: {
    handleCustomizeLabel(customize) {
      this.customizeLabel = customize
    },
  },
}
</script>
