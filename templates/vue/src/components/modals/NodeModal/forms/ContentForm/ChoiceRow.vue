<template>
  <b-row class="choice-container">
    <span v-handle class="fas fa-bars fa-s" style="margin-right: 1em;"></span>
    <div class="input-container">
      <b-input-group :class="{ 'use-images': useImages }">
        <b-input-group-prepend is-text>
          <b-form-checkbox
            :value="item.id"
            :disabled="isDisabled && selectedRadioChoice != item.id"
          />
          <file-upload
            v-if="useImages"
            v-model="item.imageUrl"
            input-test-id="node-choiceRow-thumbnail-url"
            :data-qa="`choice-row-thumbnail-${item.id}`"
            :show-url-upload="false"
            :show-image-preview="true"
            :compact-mode="true"
            file-types="image/*"
            @isUploading="handleUploadChange"
          />
        </b-input-group-prepend>
        <b-form-input
          v-model="item.value"
          class="form-input"
          :class="{ 'm-2': useImages }"
          :placeholder="placeholder"
          :data-qa="`choice-row-input-${item.id}`"
          @keyup.enter="$emit('add')"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            :disabled="removeButtonDisabled"
            variant="danger"
            @click="$emit('remove')"
          >
            X
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
  </b-row>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import { HandleDirective, ElementMixin } from "vue-slicksort"
export default {
  components: {
    FileUpload,
  },
  directives: { handle: HandleDirective },
  mixins: [ElementMixin],
  props: {
    multipleChoice: {
      type: Object,
      required: true,
    },
    allowSelectMultiple: {
      type: Boolean,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    useImages: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    selectedRadioChoice: {
      type: Number,
      required: false,
      default: 0,
    },
    removeButtonDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>

<style lang="scss">
.input-container {
  width: calc(100% - 30px);
}
.input-group {
  background: #eceef1;

  &.use-images {
    border: solid 1px #ccc;
    border-radius: 5px;
    border-color: #9c7e81;
  }
  .form-input {
    align-self: center;
  }
}
.choice-container {
  display: flex;
  align-items: center;
  z-index: 9999 !important;
}
</style>
