<template>
<slick-item 
  :index="index"
  :key="key"
  style="z-index: 9999 !important;"
  >
  <b-form-checkbox
    v-if="multipleChoiceSelected && multipleAnswerSelected" :value="key" class="container">
    <b-form-group v-if="useImages">
        <file-upload
          v-model="node.imageURL"
          input-test-id="node-choiceRow-thumbnail-url"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
    <b-form-input :placeholder="placeholder" ></b-form-input>
    <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
    </b-form-checkbox>  
  <b-form-radio v-else-if="multipleChoiceSelected && !multipleAnswerSelected" 
  :value="key" name="radios">
  <b-form-input :placeholder="placeholder" ></b-form-input>
  <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
  </b-form-radio> 
</slick-item>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import { SlickList, SlickItem } from "vue-slicksort"
export default {
  components: {
  FileUpload,
  SlickItem,
  SlickList,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    multipleChoiceSelected: {
      type: Boolean,
      required: true,
    },
    multipleAnswerSelected: {
      type: Boolean,
      required: true,
    },
    key: {
      type: Number,
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
    }
  },
}
</script>

<style lang="scss">
.container {
  display: inline-block;
}

</style>