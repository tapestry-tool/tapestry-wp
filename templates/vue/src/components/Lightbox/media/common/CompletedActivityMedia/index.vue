<template>
  <b-container class="completed-activity-media">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="type === 'text' && !isListTextType" align-self="center">
        <div class="text">
          {{ Array.isArray(answerData) ? answerData[0] : answerData }}
        </div>
      </b-col>
      <b-col v-if="type === 'text' && isListTextType">
        <ol
          :class="{
            text:
              answerData.length === 1 &&
              !question.answerTypes.multipleChoice.useImages,
          }"
        >
          <li v-for="answer in answerData" :key="answer.index">
            {{ answer }}
          </li>
        </ol>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="urlAnswer"></audio>
      </b-col>
      <b-col v-if="type === 'dragDrop'" align-self="center">
        <drag-drop
          :answer-data="answerData"
          :drag-drop="question.answerTypes.dragDrop"
        />
      </b-col>
      <b-col v-if="type === 'multipleChoice'" align-self="center">
        <ul
          :class="{
            text:
              answerData.length === 1 &&
              !question.answerTypes.multipleChoice.useImages,
          }"
        >
          <li v-for="answer in answerData" :key="answer.index">
            <completed-multiple-choice-item
              :item="getMultipleChoiceAnswerItem(answer)"
              :useImages="question.answerTypes.multipleChoice.useImages"
            />
          </li>
        </ul>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import DragDrop from "./DragDrop"
import CompletedMultipleChoiceItem from "./CompletedMultipleChoiceItem"
import { data as wpData } from "@/services/wp"

export default {
  name: "completed-activity-media",
  components: {
    DragDrop,
    CompletedMultipleChoiceItem,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val =>
        ["text", "audio", "multipleChoice", "dragDrop"].includes(val),
    },
    answerData: {
      type: [Object, String, Array, Number],
      required: true,
    },
    question: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  computed: {
    urlAnswer() {
      return (
        wpData.uploadDirArray.baseurl + "/" + this.answerData.url + "?" + Date.now()
      )
    },
    isListTextType() {
      return this.question.answerTypes?.text.allowMultiple
    },
  },
  methods: {
    getMultipleChoiceAnswerItem(id) {
      return this.question.answerTypes.multipleChoice.choices.find(
        option => option.id === id
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.completed-activity-media {
  background: #dcdcdc;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 16px 8px 16px;
  .text {
    padding: 0.5em 1em;
    background: #ffffff6b;
    display: inline-flex;
    border-radius: 5px;
    box-shadow: 0 0 5px inset #0000003b;
    margin: 0;
    list-style-type: none;
  }
}
</style>
