<template>
  <b-form @submit="handleTextSubmit">
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
        <p style="margin-top: 70px"> You Selected: {{userSelectedCheckbox}}</p>
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
        <p style="margin-top: 70px"> You Selected: {{userSelectedRadio}}</p>
      </b-form-group>
    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response.
    </b-form-invalid-feedback>

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
      userSelectedRadio: "",
      textAnswer: "",
      isAnswerValid: true,
    }
  },
  computed: {
    question() {
      return this.node.quiz[0]
    },
    textId() {
      return this.question.answers.textId
    },
    getPreSelectedRadioValue() {
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
      } else {
      return ""
      }
    },
    getPreSelectedCheckBoxValue() {
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
    },
  },
  mounted() {
    //this.textAnswer = this.question.entries.textId
     // ? this.question.entries.textId[this.textId]
     // : ""
  },
  created() {
      this.userSelectedCheckbox = this.getPreSelectedCheckBoxValue
      this.userSelectedRadio = this.getPreSelectedRadioValue
      
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.textAnswer !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.textAnswer)
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