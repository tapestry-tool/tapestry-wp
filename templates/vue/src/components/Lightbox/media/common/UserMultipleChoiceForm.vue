<template>
  <b-form @submit="handleMultipleChoiceSubmit">
      <b-form-group v-if="node.typeData.options.multipleChoice.multiAnswer">
        <b-form-checkbox-group v-model="userSelectedCheckbox" class="checkbox-group">
    <user-choice-row  v-for="(userChoiceRow) in node.typeData.options.multipleChoice.checkboxArray" 
    :key="userChoiceRow.id"
    :item="userChoiceRow"
    :isCheckBox="node.typeData.options.multipleChoice.multiAnswer"
    :hasImage="node.typeData.options.multipleChoice.useImages"
    >
    </user-choice-row>
        </b-form-checkbox-group>
        <b-form-invalid-feedback :state="checkBoxValidAnswerState" style="margin-top: 70px">
          Please Select a choice.
        </b-form-invalid-feedback>
        <p> You Selected: {{userSelectedCheckbox}}</p>
      </b-form-group>
      <b-form-group v-else-if="!node.typeData.options.multipleChoice.multiAnswer">
        <b-form-radio-group v-model="userSelectedRadio" class="radio-group">
    <user-choice-row  v-for="(userChoiceRow) in node.typeData.options.multipleChoice.radioArray" 
    :key="userChoiceRow.id"
    :item="userChoiceRow"
    :isCheckBox="node.typeData.options.multipleChoice.multiAnswer"
    :hasImage="node.typeData.options.multipleChoice.useImages">
    </user-choice-row>
        </b-form-radio-group>
        <b-form-invalid-feedback :state="radioValidAnswerState" style="margin-top: 70px">
          Please Select a choice.
        </b-form-invalid-feedback>
        <p> You Selected: {{userSelectedRadio}}</p>
       
      </b-form-group>
    <b-button
      v-if="node.mediaType === 'question'"
      class="submit-btn mt-3"
      variant="primary"
      type="submit"
    >
      Submit
    </b-button>
  </b-form>
</template>

<script>
import UserChoiceRow from "./UserChoiceRow"

export default {
  components: {
  UserChoiceRow,
  },
  name: "user-multiple-choice-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userSelectedCheckbox: [],
      userSelectedRadio: null,
      multipleChoiceAnswer: "",
    }
  },
  computed: {
    radioValidAnswerState() {
      return Boolean(this.userSelectedRadio)
    },
    checkBoxValidAnswerState() {
      if (this.userSelectedCheckbox) {
      return this.userSelectedCheckbox.length > 0
      } 
    },
    question() {
      return this.node.quiz[0]
    },
    multipleChoiceId() {
      return this.question.answers.multipleChoiceId
    },
    getPreSelectedRadioValue() {
      if (!this.node.typeData.options.multipleChoice.multiAnswer) {
      if (this.node.typeData.options.multipleChoice.selectedRadioArray.length > 0) {
        var matchingID = this.node.typeData.options.multipleChoice.selectedRadioArray[0]
        var radioArray = this.node.typeData.options.multipleChoice.radioArray
        var selectedValue = ""
        for (var i = 0; i < radioArray.length; i++) {
            if (radioArray[i].id === matchingID) {
              selectedValue = radioArray[i].value
            }
        }
        return selectedValue
      }
      } else {
      return ""
      }
    },
    getPreSelectedCheckBoxValue() {
      if (this.node.typeData.options.multipleChoice.multiAnswer) {
      var selectedCheckBoxIDs = this.node.typeData.options.multipleChoice.selectedCheckBoxArray
      if (selectedCheckBoxIDs.length > 0) {
        var checkboxArray = this.node.typeData.options.multipleChoice.checkboxArray
        var selectedValue = []
        for (var i = 0; i < selectedCheckBoxIDs.length; i++) {
          for (var j = 0; j < checkboxArray.length; j++) {
            if (checkboxArray[j].id === selectedCheckBoxIDs[i]) {
              selectedValue.push(checkboxArray[j].value)
            }
           }
        }
        return selectedValue
      } else {
        return []
      }
      }
    },
  },
  mounted() { 
      if (this.question.hasOwnProperty('entries')) {
        if (this.question.entries.hasOwnProperty('multipleChoiceId') && 
        this.question.entries.multipleChoiceId !== null) {
          this.multipleChoiceAnswer = this.question.entries.multipleChoiceId[this.multipleChoiceId]
        }
      } else {
        this.multipleChoiceAnswer = ""
      }
      this.userSelectedCheckbox = this.getPreSelectedCheckBoxValue
      this.userSelectedRadio = this.getPreSelectedRadioValue 
  },
  methods: {
    handleMultipleChoiceSubmit(event) {
      event.preventDefault()
      if(this.node.typeData.options.multipleChoice.multiAnswer) {
        if (this.checkBoxValidAnswerState) {
          this.isAnswerValid = true
        } else {
          this.isAnswerValid = false
        }
        this.multipleChoiceAnswer = this.userSelectedCheckbox
      } else {
        if (this.radioValidAnswerState) {
          this.isAnswerValid = true
        } else {
          this.isAnswerValid = false
        }
        this.multipleChoiceAnswer = this.userSelectedRadio
      }
      if (this.isAnswerValid) {
        this.$emit("submit", this.multipleChoiceAnswer)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: left;
}

.radio-group {
  // border:solid;
  display:flex;
  justify-content: space-between;
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  // border:solid;
}
</style>