<template>
<div>
  <b-form-group label="Multiple Choice Form">
    <!-- create choiceRow component(prop to determine radio or checkbox), add dragable(multi content node ordering), also include delete this option part of this choiceRow component
    button functionality(not required for now) just put a button there
    //adding imaging to choiceRow is thumbnail component -->
    <b-form-group>
        <b-form-checkbox v-model="useImages" data-qa="multiplechoice-thumbnail">
          Use Images
        </b-form-checkbox>
      </b-form-group>
      <slick-list lockAxis="y" v-model="choiceRows">
    <choice-row 
    v-for="(choiceRow, index) in choiceRows"
    :key="choiceRow.id"
    :placeholder="choiceRow.title"
    :index="index"
    :node="node" 
    :multipleChoiceSelected="multipleChoiceSelected"
    :multipleAnswerSelected="multipleAnswerSelected"
    :useImages="useImages"
    v-on:remove="choiceRows.splice(index,1)" >
    </choice-row>
      </slick-list>
    <b-button class="addButton" v-on:click="addNewChoice" variant="primary" squared>Add a choice</b-button>
  </b-form-group>
</div>
</template>

<script>
import ChoiceRow from "./ChoiceRow.vue"
import FileUpload from "@/components/modals/common/FileUpload"
import { SlickList, SlickItem } from 'vue-slicksort';

export default {
  components: {
  ChoiceRow,
  FileUpload,
  SlickList,
  SlickItem,
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
      useImages: false,
      choiceRows: [
        {
          id: 1,
          title: '1st Choice'
        },
        {
          id: 2,
          title: '2nd Choice'
        },
        {
          id: 3,
          title: '3rd Choice'
        },
      ],
      nextChoiceRowId: 4,
      newChoiceRowTitle: '',
    }
  },
  methods: {
     addNewChoice: function() {
       this.choiceRows.push({
         id: this.nextChoiceRowId++,
         title: this.newChoiceRowTitle
       })
       this.newChoiceRowTitle=''
     }
  },
}
</script>

<style lang="scss">
.addButton {
  margin-top: 20px;
}
</style>