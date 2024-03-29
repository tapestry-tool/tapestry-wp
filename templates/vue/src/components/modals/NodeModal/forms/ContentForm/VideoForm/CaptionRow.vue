<template>
  <b-card
    :bg-variant="isPending ? 'danger' : 'secondary'"
    text-variant="light"
    class="mt-2"
    data-qa="caption-row"
  >
    <b-row align-v="center" class="mb-2 mx-0">
      <div
        :id="`${captionContainerId}-toggle`"
        v-b-toggle="captionContainerId"
        :tabindex="disabled ? -1 : 0"
      >
        <b>{{ title }}</b>
        <span v-if="isDefault" class="ml-2">
          (default)
        </span>
        <span v-if="isPending && errorMessage" class="ml-2">
          <i
            :id="`caption-error-message-${caption.id}`"
            class="far fa-question-circle"
            :tabindex="disabled ? -1 : 0"
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
          :disabled="disabled"
          class="mr-3"
        >
          {{ caption.displayOnPlayer ? "Show in player" : "Hide in player" }}
        </b-form-checkbox>
        <b-button
          class="mr-1"
          size="sm"
          variant="danger"
          :disabled="disabled"
          @click="$emit('remove')"
        >
          Delete
        </b-button>
        <b-button
          v-if="isPending"
          size="sm"
          variant="primary"
          class="mr-1"
          :disabled="disabled"
          @click="$emit('move')"
        >
          Add back
        </b-button>
        <b-button
          v-else
          size="sm"
          variant="primary"
          class="mr-1"
          :disabled="disabled || (isDefault && isKaltura)"
          :data-qa="`caption-set-default-button-${index}`"
          @click="$emit('setDefault', isDefault ? null : caption.id)"
        >
          {{ !isDefault || isKaltura ? "Set as default" : "Remove default" }}
        </b-button>
        <b-button
          size="sm"
          variant="primary"
          class="download-button"
          :href="caption.captionUrl"
          :disabled="disabled || !caption.captionUrl"
          target="_blank"
          download
        >
          Download
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
                compact-mode
                :disabled="disabled"
                :file-types="allowSrt ? '.vtt, .srt' : '.vtt'"
                :placeholder="`Upload a VTT${allowSrt ? ' or SRT' : ''} file`"
                is-video
                :input-test-id="`caption-url-${index}`"
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
                :disabled="disabled"
                :data-qa="`caption-language-${index}`"
                :options="languages"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-checkbox
              switch
              :checked="customizeLabel"
              :disabled="disabled"
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
              :disabled="disabled"
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
    disabled: {
      type: Boolean,
      required: true,
    },
    isKaltura: {
      type: Boolean,
      required: true,
    },
    allowSrt: {
      type: Boolean,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
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

<style lang="scss" scoped>
.download-button {
  color: inherit !important; // Override Tapestry link styling

  &:focus {
    text-decoration: none; // Prevent underline when focused
  }
}
</style>
