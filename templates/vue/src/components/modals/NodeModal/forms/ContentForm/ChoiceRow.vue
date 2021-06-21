<template>
  <div
    v-if="multipleAnswerSelected"
    style="z-index: 9999 !important;"
    class="container"
  >
    <span id="handle" v-handle class="fas fa-bars fa-s"></span>
    <b-form-checkbox :value="item.id">
      <b-form-group v-if="useImages">
        <file-upload
          v-model="item.imageurl"
          input-test-id="node-choiceRow-thumbnail-url"
          :data-qa="`choicerow-checkbox-thumbnail-${item.id}`"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
    </b-form-checkbox>
    <b-form-input
      v-model="item.value"
      style="width: 50%; margin-left: -20px;"
      :placeholder="placeholder"
      :data-qa="`choicerow-checkbox-input-${item.id}`"
    ></b-form-input>
    <b-button
      :disabled="removeButtonDisabled"
      squared
      variant="outline-danger"
      @click="$emit('remove')"
    >
      Remove
    </b-button>
  </div>

  <div v-else style="z-index: 9999 !important;" class="container">
    <span id="handle" v-handle class="fas fa-bars fa-s"></span>
    <b-form-checkbox
      :value="item.id"
      :disabled="isDisabled && selectedRadioChoice != item.id"
    >
      <b-form-group v-if="useImages">
        <file-upload
          v-model="item.imageurl"
          input-test-id="node-choiceRow-thumbnail-url"
          :data-qa="`choicerow-radio-thumbnail-${item.id}`"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
      <!-- <div>SelectedRadiochoice: <strong>{{ selectedRadioChoice}}</strong></div> -->
    </b-form-checkbox>
    <b-form-input
      v-model="item.value"
      style="width: 50%; margin-left: -20px;"
      :placeholder="placeholder"
      :data-qa="`choicerow-radio-input-${item.id}`"
    ></b-form-input>
    <b-button
      :disabled="removeButtonDisabled"
      squared
      variant="outline-danger"
      @click="$emit('remove')"
    >
      Remove
    </b-button>
  </div>
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
    question: {
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
.inputchoice {
  width: 50%;
}
.container {
  display: flex;
  align-items: center;
}
#handle {
  margin-right: 5px;
}
</style>
