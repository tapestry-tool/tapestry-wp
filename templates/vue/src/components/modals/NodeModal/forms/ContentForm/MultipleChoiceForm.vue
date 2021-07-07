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
      <b-form-group>
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
              :data-qa="`choice-row-${choiceRow.id}`"
              :item="choiceRow"
              placeholder="answer option text"
              :index="index"
              :multipleChoice="multipleChoice"
              :multipleAnswerSelected="multipleAnswerSelected"
              :useImages="useImages"
              :isDisabled="!multipleAnswerSelected && preSelectedOptions.length > 0"
              :selectedRadioChoice="preSelectedOptions[0]"
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
    }
  },
  computed: {
    multipleAnswerSelected() {
      return this.multipleChoice.hasMultipleAnswers
    },
    isRemoveButtonDisabled() {
      return this.choiceRows.length === 1
    },
    choicesGroupHeight() {
      if (this.useImages) {
        return 150 * this.choiceRows.length + "px"
      } else {
        return 40 * this.choiceRows.length + "px"
      }
    },
  },
  watch: {
    multipleAnswerSelected() {
      this.preSelectedOptions = []
    },
    choiceRows(newChoiceRows) {
      this.multipleChoice.choices = newChoiceRows
    },
    useImages(newUseImages) {
      this.multipleChoice.useImages = newUseImages
    },
    preSelectedOptions(newPreSelectedOptions) {
      this.multipleChoice.preSelectedOptions = newPreSelectedOptions
    },
    nextChoiceRowId(newNextChoiceRowId) {
      this.multipleChoice.nextChoiceRowId = newNextChoiceRowId
    },
  },
  created() {
    if (
      !this.multipleChoice.hasOwnProperty("choices") ||
      !this.multipleChoice.hasOwnProperty("useImages")
    ) {
      this.multipleChoice.choices = this.choiceRows
      this.multipleChoice.nextChoiceRowId = this.nextChoiceRowId
      this.multipleChoice.useImages = this.useImages
      this.multipleChoice.preSelectedOptions = this.preSelectedOptions
    } else {
      this.choiceRows = this.multipleChoice.choices
      this.nextChoiceRowId = this.multipleChoice.nextChoiceRowId
      this.useImages = this.multipleChoice.useImages
      this.preSelectedOptions = this.multipleChoice.preSelectedOptions
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
    removeChoiceRow: function(index, item) {
      this.multipleChoice.choices.splice(index, 1)
      for (let i = 0; i < this.preSelectedOptions.length; i++) {
        if (item.id === this.preSelectedOptions[i]) {
          this.preSelectedOptions.splice(i, 1)
        }
      }
    },
    updateChoicesOrdering(arr) {
      this.multipleChoice.choices = arr
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
