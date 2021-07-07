<template>
  <div class="container">
    <span v-handle class="fas fa-bars fa-s" style="margin-right: 5px;"></span>
    <b-form-checkbox
      :value="item.id"
      :disabled="isDisabled && selectedRadioChoice != item.id"
    />
    <b-form-group v-if="useImages">
      <file-upload
        v-model="item.imageUrl"
        input-test-id="node-choiceRow-thumbnail-url"
        :data-qa="`choice-row-thumbnail-${item.id}`"
        :show-url-upload="false"
        :show-image-preview="true"
        :compact-mode="true"
        file-types="image/*"
        @isUploading="handleUploadChange"
      />
    </b-form-group>
    <div :class="useImages ? 'input-container-image' : 'input-container'">
      <b-form-input
        v-model="item.value"
        class="form-input"
        :placeholder="placeholder"
        :data-qa="`choice-row-input-${item.id}`"
      ></b-form-input>
    </div>
    <b-button
      :disabled="removeButtonDisabled"
      squared
      variant="outline-danger"
      @click="$emit('remove')"
    >
      Remove
    </b-button>
  </div>

  <!-- <div v-else class="container">
    <span v-handle class="fas fa-bars fa-s" style="margin-right: 5px;"></span>
    <b-form-checkbox
      :value="item.id"
      :disabled="isDisabled && selectedRadioChoice != item.id"
    />
    <b-form-group v-if="useImages">
      <file-upload
        v-model="item.imageUrl"
        input-test-id="node-choiceRow-thumbnail-url"
        :data-qa="`choicerow-radio-thumbnail-${item.id}`"
        :show-url-upload="false"
        :show-image-preview="true"
        :compact-mode="true"
        file-types="image/*"
        @isUploading="handleUploadChange"
      />
    </b-form-group>
    <div :class="useImages ? 'input-container-image' : 'input-container'">
      <b-form-input
        v-model="item.value"
        class="form-input"
        :placeholder="placeholder"
        :data-qa="`choicerow-radio-input-${item.id}`"
      ></b-form-input>
    </div>
    <b-button
      :disabled="removeButtonDisabled"
      squared
      variant="outline-danger"
      @click="$emit('remove')"
    >
      Remove
    </b-button>
  </div> -->
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
    multipleAnswerSelected: {
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
  margin-right: -20px;
  width: 500px;
}
.input-container-image {
  margin-right: -20px;
  width: 100px;
}
.form-input {
  margin-left: -20px;
}
.container {
  display: flex;
  align-items: center;
  z-index: 9999 !important;
}
</style>
