<template>
  <b-container class="completed-activity-media">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="type === 'text'" align-self="center">
        <div class="text">
          {{ answerData }}
        </div>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="answerData"></audio>
      </b-col>
      <b-col v-if="type === 'multipleChoice'" align-self="center">
        <ul v-if="question.answerTypes.multipleChoice.hasMultipleAnswers">
          <li v-for="answer in answerData" :key="answer.index">
            <previous-activity-choice-row
              :item="getMultipleChoiceOptionObject(answer)"
              :useImages="question.answerTypes.multipleChoice.useImages"
            />
          </li>
        </ul>
        <ul v-else>
          <li>
            <previous-activity-choice-row
              :item="getRadioMultipleChoiceOptionObject(answerData)"
              :useImages="question.answerTypes.multipleChoice.useImages"
            />
          </li>
        </ul>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PreviousActivityChoiceRow from "./PreviousActivityChoiceRow.vue"

export default {
  name: "tapestry-activity",
  components: {
    PreviousActivityChoiceRow,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio", "multipleChoice"].includes(val),
    },
    answerData: {
      type: [String, Array, Number],
      required: true,
    },
    question: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  methods: {
    getMultipleChoiceOptionObject(id) {
      for (
        let i = 0;
        i < this.question.answerTypes.multipleChoice.checkboxArray.length;
        i++
      ) {
        if (this.question.answerTypes.multipleChoice.checkboxArray[i].id === id) {
          return this.question.answerTypes.multipleChoice.checkboxArray[i]
        }
      }
    },
    getRadioMultipleChoiceOptionObject(id) {
      for (
        let i = 0;
        i < this.question.answerTypes.multipleChoice.radioArray.length;
        i++
      ) {
        if (this.question.answerTypes.multipleChoice.radioArray[i].id === id) {
          return this.question.answerTypes.multipleChoice.radioArray[i]
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.completed-activity-media {
  background: #262626;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 16px 8px 16px;
  .text {
    text-align: left;
    padding-left: 1em;
    border-left: solid 1px #666;
  }
}
</style>
