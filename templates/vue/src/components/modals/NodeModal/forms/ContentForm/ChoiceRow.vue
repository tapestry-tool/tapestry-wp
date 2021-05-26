<template >
<div style="z-index: 9999 !important;" class="container">
  <span v-handle class="fas fa-bars fa-xs" id="handle"></span>
  <b-form-checkbox 
    v-if="multipleChoiceSelected && multipleAnswerSelected" :value=item.id>
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
    <b-form-input :placeholder="placeholder"
    v-model="node.typeData.options.multipleChoice.checkboxArray[index].value"
    :data-qa="`choicerow-checkbox-input-${item.id}`"
    ></b-form-input>
    <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
    </b-form-checkbox>  
  <b-form-checkbox :value=item.id v-else-if="multipleChoiceSelected && !multipleAnswerSelected" :disabled="isDisabled && selectedRadioChoice!= item.id">
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
  <b-form-input :placeholder="placeholder" 
   v-model="node.typeData.options.multipleChoice.radioArray[index].value"
   :data-qa="`choicerow-radio-input-${item.id}`"
  ></b-form-input>
  <b-button squared variant="outline-danger" v-on:click="$emit('remove')">Remove</b-button>
  <!-- <div>SelectedRadiochoice: <strong>{{ selectedRadioChoice}}</strong></div> -->
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
    checkBoxValue: '',
    radioValue: '',
    }
  },
  watch: {
    checkBoxValue: function(newCheckBoxValue) {
      this.$emit("newCheckBoxValue",{newValue: newCheckBoxValue, 
      choiceIndex: this.index, choiceRowItem: this.item})
    },
    radioValue: function(newRadioValue) {
      this.$emit("newRadioValue",{newValue: newRadioValue, 
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
}
#handle{
  margin-right: 5px;
  margin-top: 7px;
}

</style>