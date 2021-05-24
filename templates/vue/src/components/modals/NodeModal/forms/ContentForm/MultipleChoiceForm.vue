<template>
<div>
  <div>current data for multiple choice answer type is: {{this.node.typeData.options.multipleChoice}}</div>
  <b-form-group :label="multipleAnswerSelected ? 'Checkbox Form' : 'Radio Form'">
    <!-- create choiceRow component(prop to determine radio or checkbox), add dragable(multi content node ordering), also include delete this option part of this choiceRow component
    button functionality(not required for now) just put a button there
    //adding imaging to choiceRow is thumbnail component -->
    <b-form-group>
        <b-form-checkbox v-model="useImages" data-qa="multiplechoice-thumbnail">
          Use Images
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="multipleAnswerSelected">
      <SortableList lockAxis="y" v-model="choiceRows" :useDragHandle="true" @input="updateOrderingCheckBoxArray">
        <b-form-checkbox-group v-model="selectedCheckBoxForm">
    <choice-row 
    v-for="(choiceRow, index) in choiceRows"
    :item="choiceRow"
    :key="choiceRow.id"
    :placeholder="choiceRow.title"
    :index="index"
    :node="node" 
    :multipleChoiceSelected="multipleChoiceSelected"
    :multipleAnswerSelected="multipleAnswerSelected"
    :useImages="useImages"
    v-on:remove="choiceRows.splice(index,1)" 
    @newCheckBoxValue="handleNewCheckBoxValue">
    </choice-row>
        </b-form-checkbox-group>
      </SortableList>
    <b-button class="addButton" v-on:click="addNewChoice" variant="primary" squared>Add a choice</b-button>
    <div class="mt-3">SelectedCheckBoxForm: <strong>{{ selectedCheckBoxForm }}</strong></div>
      </b-form-group>

      <b-form-group v-else-if="!multipleAnswerSelected">
      <SortableList lockAxis="y" v-model="choiceRowsRadio" :useDragHandle="true" @input="updateOrderingRadioArray">
        <b-form-checkbox-group v-model="selectedRadioForm">
    <choice-row 
    v-for="(choiceRow, index) in choiceRowsRadio"
    :item="choiceRow"
    :key="choiceRow.id"
    :placeholder="choiceRow.title"
    :index="index"
    :node="node" 
    :multipleChoiceSelected="multipleChoiceSelected"
    :multipleAnswerSelected="multipleAnswerSelected"
    :useImages="useImages"
    :isDisabled="selectedRadioForm.length > 0"
    :selectedRadioChoice="selectedRadioForm[0]"
    v-on:remove="choiceRowsRadio.splice(index,1)" 
    @newRadioValue="handleNewRadioValue">
    </choice-row>
    </b-form-checkbox-group>
      </SortableList>
    <b-button class="addButton" v-on:click="addNewChoiceRadio" variant="primary" squared>Add a choice</b-button>
    <div class="mt-3">SelectedRadioForm: <strong>{{ selectedRadioForm }}</strong></div>
      </b-form-group>
  </b-form-group>
</div>
</template>

<script>
import ChoiceRow from "./ChoiceRow.vue"
import FileUpload from "@/components/modals/common/FileUpload"
import { ContainerMixin,} from 'vue-slicksort';
const SortableList = {
  mixins: [ContainerMixin],
  template: `
    <ul class="list">
      <slot />
    </ul>
  `,
};

export default {
  components: {
  ChoiceRow,
  FileUpload,
  SortableList
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
  },
  data() {
    return {
      selectedCheckBoxForm: [],
      selectedRadioForm: [],
      useImages: false,
      choiceRows: [
        {
          id: 1,
          imageurl: '',
          value: '',
          title: '1st Choice',
        },
        {
          id: 2,
          imageurl: '',
          value: '',
          title: '2nd Choice',
        },
        {
          id: 3,
          imageurl: '',
          value: '',
          title: '3rd Choice',
        },
      ],
      nextChoiceRowId: 4,
      newChoiceRowTitle: '',
      choiceRowsRadio: [
        {
          id: 50,
          imageurl: '',
          value: '',
          title: '1st Choice'
        },
        {
          id: 51,
          imageurl: '',
          value: '',
          title: '2nd Choice'
        },
        {
          id: 52,
          imageurl: '',
          value: '',
          title: '3rd Choice'
        },
      ],
      nextChoiceRowRadioId: 53,
      newChoiceRowRadioTitle: '',
    }
  },
  watch: {
    choiceRows(newChoiceRows) {
      this.node.typeData.options.multipleChoice.checkboxArray = newChoiceRows
    },
    choiceRowsRadio(newChoiceRowsRadio) {
      this.node.typeData.options.multipleChoice.radioArray = newChoiceRowsRadio
    },
    useImages(newUseImages) {
      this.node.typeData.options.multipleChoice.useImages = newUseImages
    },
    selectedCheckBoxForm(newSelectedCheckBoxForm) {
      this.node.typeData.options.multipleChoice.selectedCheckBoxArray = newSelectedCheckBoxForm
    },
    selectedRadioForm(newSelectedRadioForm) {
      this.node.typeData.options.multipleChoice.selectedRadioArray = newSelectedRadioForm
    },
  },
  created() {
      if (!this.node.typeData.options.multipleChoice.hasOwnProperty('checkboxArray') &&
      !this.node.typeData.options.multipleChoice.hasOwnProperty('radioArray') &&
      !this.node.typeData.options.multipleChoice.hasOwnProperty('useImages')) {
        this.node.typeData.options.multipleChoice.checkboxArray = this.choiceRows
        this.node.typeData.options.multipleChoice.radioArray = this.choiceRowsRadio
        this.node.typeData.options.multipleChoice.useImages = this.useImages
      } else {
      this.useImages = this.node.typeData.options.multipleChoice.useImages
      this.choiceRowsRadio = this.node.typeData.options.multipleChoice.radioArray
      this.choiceRows = this.node.typeData.options.multipleChoice.checkboxArray
      this.selectedCheckBoxForm = this.node.typeData.options.multipleChoice.selectedCheckBoxArray
      this.selectedRadioForm = this.node.typeData.options.multipleChoice.selectedRadioArray
      }
  },
  methods: {
     addNewChoice: function() {
       this.choiceRows.push({
         id: this.nextChoiceRowId++,
         imageurl: '',
         value: '',
         title: this.newChoiceRowTitle,
       })
       this.newChoiceRowTitle=''
     },
     addNewChoiceRadio: function() {
       this.choiceRowsRadio.push({
         id: this.nextChoiceRowRadioId++,
         imageurl: '',
         value: '',
         title: this.newChoiceRowRadioTitle
       })
       this.newChoiceRowRadioTitle=''
     },
     updateOrderingCheckBoxArray(arr) {
      this.node.typeData.options.multipleChoice.checkboxArray = arr
    },
    updateOrderingRadioArray(arr) {
      this.node.typeData.options.multipleChoice.radioArray = arr
    },
    handleNewCheckBoxValue({newValue, choiceIndex, choiceRowItem}){
      this.choiceRows[choiceIndex].value = newValue
      choiceRowItem.value = newValue
    },
    handleNewRadioValue({newValue, choiceIndex, choiceRowItem}){
      this.choiceRowsRadio[choiceIndex].value = newValue
      choiceRowItem.value = newValue
    },
  },
}
</script>

<style lang="scss">
.addButton {
  margin-top: 10px;
  margin-left: 30px;
}
</style>