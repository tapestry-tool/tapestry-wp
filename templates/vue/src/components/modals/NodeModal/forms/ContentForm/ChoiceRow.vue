<template >
<div style="z-index: 9999 !important;" class="container">
  <span v-handle class="fas fa-bars fa-xs" id="handle"></span>
  <b-form-checkbox 
    v-if="multipleChoiceSelected && multipleAnswerSelected" :value=item.id>
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
  <b-form-checkbox :value=item.id v-else-if="multipleChoiceSelected && !multipleAnswerSelected" v-model="selectedRadio" :disabled="isDisabled && selectedRadio!= item.id">
  <b-form-input :placeholder="placeholder" ></b-form-input>
  <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
  <div>SelectedRadio: <strong>{{ selectedRadio }}</strong></div>
  </b-form-checkbox> 
</div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import { SlickList, SlickItem, HandleDirective, ContainerMixin, ElementMixin} from "vue-slicksort"
export default {
  components: {
  FileUpload,
  SlickItem,
  SlickList,
  },
  directives: { handle: HandleDirective },
  mixins: [ElementMixin],
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
      required: false,
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
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
      return {
        selectedRadio: -1
      }
    },
}
</script>

<style lang="scss">
.container {
  display: flex;
  //border-style:solid;
}
#handle{
  //border-style: solid;
  margin-right: 5px;
  margin-top: 7px;
}

</style>