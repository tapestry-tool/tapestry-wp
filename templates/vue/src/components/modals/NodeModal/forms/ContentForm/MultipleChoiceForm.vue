<template>
  <div>
    <b-form-group
      :label="
        multipleAnswerSelected ? 'Multiple Answers Form' : 'Single Answer Form'
      "
    >
      <b-form-group>
        <b-form-checkbox v-model="useImages" data-qa="multiple-choice-thumbnail">
          Use Images
        </b-form-checkbox>
      </b-form-group>
      <p>multipleAnswerSelected is {{ multipleAnswerSelected }}</p>
      <p>multipleChoice is {{ multipleChoice }}</p>
      <b-form-group v-if="multipleAnswerSelected">
        <sortable-list
          v-model="choiceRows"
          lockAxis="y"
          :useDragHandle="true"
          @input="updateChoicesOrdering"
        >
          <b-form-checkbox-group
            v-model="preSelectedOptions"
            :style="{ height: choicesGroupHeight }"
          >
            <choice-row
              v-for="(choiceRow, index) in choiceRows"
              :key="choiceRow.id"
              :data-qa="`choicerow-checkbox-${choiceRow.id}`"
              :item="choiceRow"
              placeholder="answer option text"
              :index="index"
              :multipleChoice="multipleChoice"
              :multipleAnswerSelected="multipleAnswerSelected"
              :useImages="useImages"
              :removeButtonDisabled="isRemoveButtonDisabled"
              @remove="removeChoiceRow(index, choiceRow)"
            ></choice-row>
          </b-form-checkbox-group>
        </sortable-list>
        <b-button class="add-button" variant="primary" squared @click="addNewChoice">
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
            :style="{ height: radioGroupHeight }"
          >
            <choice-row
              v-for="(choiceRow, index) in choiceRowsRadio"
              :key="choiceRow.id"
              :data-qa="`choicerow-radio-${choiceRow.id}`"
              :item="choiceRow"
              placeholder="answer option text"
              :index="index"
              :multipleChoice="multipleChoice"
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
          class="add-button"
          variant="primary"
          squared
          @click="addNewChoiceRadio"
        >
          Add a choice
        </b-button>
        <p class="message">
          Select any options that should be selected by default when posing the
          question.
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
    multipleChoice: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      preSelectedOptions: [],
      preSelectedRadioOptions: [],
      useImages: false,
      choiceRows: [
        {
          id: 1,
          imageUrl: "",
          value: "",
        },
        {
          id: 2,
          imageUrl: "",
          value: "",
        },
        {
          id: 3,
          imageUrl: "",
          value: "",
        },
      ],
      nextChoiceRowId: 4,
      choiceRowsRadio: [
        {
          id: 50,
          imageUrl: "",
          value: "",
        },
        {
          id: 51,
          imageUrl: "",
          value: "",
        },
        {
          id: 52,
          imageUrl: "",
          value: "",
        },
      ],
      nextChoiceRowRadioId: 53,
    }
  },
  computed: {
    multipleAnswerSelected() {
      return this.multipleChoice.hasMultipleAnswers
    },
    isRemoveButtonDisabled() {
      if (this.multipleAnswerSelected) {
        return this.choiceRows.length === 1
      } else {
        return this.choiceRowsRadio.length === 1
      }
    },
    choicesGroupHeight() {
      if (this.useImages) {
        return 150 * this.choiceRows.length + "px"
      } else {
        return 40 * this.choiceRows.length + "px"
      }
    },
    radioGroupHeight() {
      if (this.useImages) {
        return 150 * this.choiceRowsRadio.length + "px"
      } else {
        return 40 * this.choiceRowsRadio.length + "px"
      }
    },
  },
  watch: {
    choiceRows(newChoiceRows) {
      this.multipleChoice.choices = newChoiceRows
    },
    choiceRowsRadio(newChoiceRowsRadio) {
      this.multipleChoice.radioArray = newChoiceRowsRadio
    },
    useImages(newUseImages) {
      this.multipleChoice.useImages = newUseImages
    },
    preSelectedOptions(newPreSelectedOptions) {
      this.multipleChoice.preSelectedOptions = newPreSelectedOptions
    },
    preSelectedRadioOptions(newPreSelectedRadioOptions) {
      this.multipleChoice.preSelectedRadioOptions = newPreSelectedRadioOptions
    },
    nextChoiceRowId(newNextChoiceRowId) {
      this.multipleChoice.nextChoiceRowId = newNextChoiceRowId
    },
    nextChoiceRowRadioId(newNextChoiceRowRadioId) {
      this.multipleChoice.nextChoiceRowRadioId = newNextChoiceRowRadioId
    },
  },
  created() {
    if (
      !this.multipleChoice.hasOwnProperty("choices") ||
      !this.multipleChoice.hasOwnProperty("radioArray") ||
      !this.multipleChoice.hasOwnProperty("useImages")
    ) {
      this.multipleChoice.choices = this.choiceRows
      this.multipleChoice.radioArray = this.choiceRowsRadio
      this.multipleChoice.nextChoiceRowId = this.nextChoiceRowId
      this.multipleChoice.nextChoiceRowRadioId = this.nextChoiceRowRadioId
      this.multipleChoice.useImages = this.useImages
      this.multipleChoice.preSelectedOptions = this.preSelectedOptions
      this.multipleChoice.preSelectedRadioOptions = this.preSelectedRadioOptions
    } else {
      this.choiceRows = this.multipleChoice.choices
      this.choiceRowsRadio = this.multipleChoice.radioArray
      this.nextChoiceRowId = this.multipleChoice.nextChoiceRowId
      this.nextChoiceRowRadioId = this.multipleChoice.nextChoiceRowRadioId
      this.useImages = this.multipleChoice.useImages
      this.preSelectedOptions = this.multipleChoice.preSelectedOptions
      this.preSelectedRadioOptions = this.multipleChoice.preSelectedRadioOptions
    }
  },
  methods: {
    addNewChoice: function() {
      this.choiceRows.push({
        id: this.nextChoiceRowId++,
        imageUrl: "",
        value: "",
      })
    },
    addNewChoiceRadio: function() {
      this.choiceRowsRadio.push({
        id: this.nextChoiceRowRadioId++,
        imageUrl: "",
        value: "",
      })
    },
    removeChoiceRow: function(index, item) {
      this.multipleChoice.choices.splice(index, 1)
      for (let i = 0; i < this.preSelectedOptions.length; i++) {
        if (item.id === this.preSelectedOptions[i]) {
          this.preSelectedOptions.splice(i, 1)
        }
      }
    },
    removeChoiceRowRadio: function(index, item) {
      this.multipleChoice.radioArray.splice(index, 1)
      for (let i = 0; i < this.preSelectedRadioOptions.length; i++) {
        if (item.id === this.preSelectedRadioOptions[i]) {
          this.preSelectedRadioOptions.splice(i, 1)
        }
      }
    },
    updateChoicesOrdering(arr) {
      this.multipleChoice.choices = arr
    },
    updateOrderingRadioArray(arr) {
      this.multipleChoice.radioArray = arr
    },
  },
}
</script>

<style lang="scss">
.add-button {
  margin-top: 10px;
  margin-left: 30px;
}
.message {
  font-size: 15px;
  color: #6c757d;
  margin-top: 10px;
}
</style>
