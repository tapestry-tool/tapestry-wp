<template >
<div style="z-index: 9999 !important;" class="container">
  <span v-handle class="fas fa-bars fa-xs" id="handle"></span>
  <b-form-checkbox 
    v-if="multipleChoiceSelected && multipleAnswerSelected" :value=item.id>
    <b-form-group v-if="useImages">
        <file-upload
          v-model="item.imageurl" 
          input-test-id="node-choiceRow-thumbnail-url"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
    <b-form-input :placeholder="placeholder" v-model="checkBoxQuestion"></b-form-input>
    <p>newquestion is: {{checkBoxQuestion}}</p>
    <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
    </b-form-checkbox>  
  <b-form-checkbox :value=item.id v-else-if="multipleChoiceSelected && !multipleAnswerSelected" :disabled="isDisabled && selectedRadioChoice!= item.id">
    <b-form-group v-if="useImages">
        <file-upload
          v-model="item.imageurl" 
          input-test-id="node-choiceRow-thumbnail-url"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
  <b-form-input :placeholder="placeholder" v-model="radioQuestion"></b-form-input>
  <p>new question is: {{radioQuestion}}</p>
  <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
  <div>SelectedRadiochoice: <strong>{{ selectedRadioChoice}}</strong></div>
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
  data() {
    return {
    checkBoxQuestion: '',
    radioQuestion: '',
    }
  },
  watch: {
    checkBoxQuestion: function(newCheckBoxQuestion) {
      this.$emit("newCheckBoxQuestion",{newQuestion: newCheckBoxQuestion, 
      choiceIndex: this.index, choiceRowItem: this.item})
    },
    radioQuestion: function(newRadioQuestion) {
      this.$emit("newRadioQuestion",{newQuestion: newRadioQuestion, 
      choiceIndex: this.index, choiceRowItem: this.item})
    },
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
    selectedRadioChoice: {
      type: Number,
      required: false,
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