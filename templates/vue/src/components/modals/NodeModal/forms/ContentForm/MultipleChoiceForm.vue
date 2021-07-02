<template>
  <div>
    <b-form-group
      :label="
        multipleAnswerSelected ? 'Multiple Answers Form' : 'Single Answer Form'
      "
    >
      <b-form-group>
        <b-form-checkbox v-model="useImages" data-qa="multiplechoice-thumbnail">
          Use Images
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="multipleAnswerSelected">
        <sortable-list
          v-model="choiceRows"
          lockAxis="y"
          :useDragHandle="true"
          @input="updateOrderingCheckBoxArray"
        >
          <b-form-checkbox-group
            v-model="preSelectedCheckBoxOptions"
            class="checkboxGroup"
          >
            <choice-row
              v-for="(choiceRow, index) in choiceRows"
              :key="choiceRow.id"
              :data-qa="`choicerow-checkbox-${choiceRow.id}`"
              :item="choiceRow"
              placeholder="answer option text"
              :index="index"
              :question="question"
              :multipleAnswerSelected="multipleAnswerSelected"
              :useImages="useImages"
              :removeButtonDisabled="isRemoveButtonDisabled"
              @remove="removeChoiceRowCheckbox(index, choiceRow)"
            ></choice-row>
          </b-form-checkbox-group>
        </sortable-list>
        <b-button class="addButton" variant="primary" squared @click="addNewChoice">
          Add a choice
        </b-button>
        <p class="message">
          Tick any options that should be selected by default in the question
        </p>
      </b-form-group>

      <b-form-group v-else-if="!multipleAnswerSelected">
        <sortable-list
          v-model="choiceRowsRadio"
          lockAxis="y"
          :useDragHandle="true"
          @input="updateOrderingRadioArray"
        >
          <b-form-checkbox-group
            v-model="preSelectedRadioOptions"
            class="radioGroup"
          >
            <choice-row
              v-for="(choiceRow, index) in choiceRowsRadio"
              :key="choiceRow.id"
              :data-qa="`choicerow-radio-${choiceRow.id}`"
              :item="choiceRow"
              placeholder="answer option text"
              :index="index"
              :question="question"
              :multipleAnswerSelected="multipleAnswerSelected"
              :useImages="useImages"
              :isDisabled="preSelectedRadioOptions.length > 0"
              :selectedRadioChoice="preSelectedRadioOptions[0]"
              :removeButtonDisabled="isRemoveButtonDisabled"
              @remove="removeChoiceRowRadio(index, choiceRow)"
            >
              >
            </choice-row>
          </b-form-checkbox-group>
        </sortable-list>
        <b-button
          class="addButton"
          variant="primary"
          squared
          @click="addNewChoiceRadio"
        >
          Add a choice
        </b-button>
        <p class="message">
          Tick any options that should be selected by default in the question
        </p>
      </b-form-group>
    </b-form-group>
  </div>
</template>

<script>
import ChoiceRow from "./ChoiceRow"
import { ContainerMixin } from "vue-slicksort"
const SortableList = {
  mixins: [ContainerMixin],
  template: `
    <ul class="list">
      <slot />
    </ul>
  `,
}
export default {
  components: {
    ChoiceRow,
    SortableList,
  },
  props: {
    question: {
      type: Object,
      required: true,
    },
    multipleAnswerSelected: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      preSelectedCheckBoxOptions: [],
      preSelectedRadioOptions: [],
      useImages: false,
      choiceRows: [
        {
          id: 1,
          imageurl: "",
          value: "",
        },
        {
          id: 2,
          imageurl: "",
          value: "",
        },
        {
          id: 3,
          imageurl: "",
          value: "",
        },
      ],
      nextChoiceRowId: 4,
      choiceRowsRadio: [
        {
          id: 50,
          imageurl: "",
          value: "",
        },
        {
          id: 51,
          imageurl: "",
          value: "",
        },
        {
          id: 52,
          imageurl: "",
          value: "",
        },
      ],
      nextChoiceRowRadioId: 53,
    }
  },
  computed: {
    isRemoveButtonDisabled() {
      if (this.multipleAnswerSelected) {
        return this.choiceRows.length === 1
      } else {
        return this.choiceRowsRadio.length === 1
      }
    },
  },
  watch: {
    choiceRows(newChoiceRows) {
      this.question.answerTypes.multipleChoice.checkboxArray = newChoiceRows
    },
    choiceRowsRadio(newChoiceRowsRadio) {
      this.question.answerTypes.multipleChoice.radioArray = newChoiceRowsRadio
    },
    useImages(newUseImages) {
      this.question.answerTypes.multipleChoice.useImages = newUseImages
    },
    preSelectedCheckBoxOptions(newPreSelectedCheckBoxOptions) {
      this.question.answerTypes.multipleChoice.preSelectedCheckBoxOptions = newPreSelectedCheckBoxOptions
    },
    preSelectedRadioOptions(newPreSelectedRadioOptions) {
      this.question.answerTypes.multipleChoice.preSelectedRadioOptions = newPreSelectedRadioOptions
    },
    nextChoiceRowId(newNextChoiceRowId) {
      this.question.answerTypes.multipleChoice.nextChoiceRowId = newNextChoiceRowId
    },
    nextChoiceRowRadioId(newNextChoiceRowRadioId) {
      this.question.answerTypes.multipleChoice.nextChoiceRowRadioId = newNextChoiceRowRadioId
    },
  },
  created() {
    if (
      !this.question.answerTypes.multipleChoice.hasOwnProperty("checkboxArray") ||
      !this.question.answerTypes.multipleChoice.hasOwnProperty("radioArray") ||
      !this.question.answerTypes.multipleChoice.hasOwnProperty("useImages")
    ) {
      this.question.answerTypes.multipleChoice.checkboxArray = this.choiceRows
      this.question.answerTypes.multipleChoice.radioArray = this.choiceRowsRadio
      this.question.answerTypes.multipleChoice.nextChoiceRowId = this.nextChoiceRowId
      this.question.answerTypes.multipleChoice.nextChoiceRowRadioId = this.nextChoiceRowRadioId
      this.question.answerTypes.multipleChoice.useImages = this.useImages
      this.question.answerTypes.multipleChoice.preSelectedCheckBoxOptions = this.preSelectedCheckBoxOptions
      this.question.answerTypes.multipleChoice.preSelectedRadioOptions = this.preSelectedRadioOptions
    } else {
      this.choiceRows = this.question.answerTypes.multipleChoice.checkboxArray
      this.choiceRowsRadio = this.question.answerTypes.multipleChoice.radioArray
      this.nextChoiceRowId = this.question.answerTypes.multipleChoice.nextChoiceRowId
      this.nextChoiceRowRadioId = this.question.answerTypes.multipleChoice.nextChoiceRowRadioId
      this.useImages = this.question.answerTypes.multipleChoice.useImages
      this.preSelectedCheckBoxOptions = this.question.answerTypes.multipleChoice.preSelectedCheckBoxOptions
      this.preSelectedRadioOptions = this.question.answerTypes.multipleChoice.preSelectedRadioOptions
    }
  },
  methods: {
    addNewChoice: function() {
      this.choiceRows.push({
        id: this.nextChoiceRowId++,
        imageurl: "",
        value: "",
      })
    },
    addNewChoiceRadio: function() {
      this.choiceRowsRadio.push({
        id: this.nextChoiceRowRadioId++,
        imageurl: "",
        value: "",
      })
    },
    removeChoiceRowCheckbox: function(index, item) {
      this.question.answerTypes.multipleChoice.checkboxArray.splice(index, 1)
      for (let i = 0; i < this.preSelectedCheckBoxOptions.length; i++) {
        if (item.id === this.preSelectedCheckBoxOptions[i]) {
          this.preSelectedCheckBoxOptions.splice(i, 1)
        }
      }
    },
    removeChoiceRowRadio: function(index, item) {
      this.question.answerTypes.multipleChoice.radioArray.splice(index, 1)
      for (let i = 0; i < this.preSelectedRadioOptions.length; i++) {
        if (item.id === this.preSelectedRadioOptions[i]) {
          this.preSelectedRadioOptions.splice(i, 1)
        }
      }
    },
    updateOrderingCheckBoxArray(arr) {
      this.question.answerTypes.multipleChoice.checkboxArray = arr
    },
    updateOrderingRadioArray(arr) {
      this.question.answerTypes.multipleChoice.radioArray = arr
    },
  },
}
</script>

<style lang="scss">
.checkboxGroup {
  height: 120px;
}
.radioGroup {
  height: 120px;
}
.addButton {
  margin-top: 10px;
  margin-left: 30px;
}
.message {
  font-size: 15px;
  color: #6c757d;
  margin-top: 10px;
}
</style>
