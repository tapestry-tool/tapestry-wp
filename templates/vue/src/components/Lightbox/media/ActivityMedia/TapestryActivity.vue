<template>
  <b-container class="tapestry-activity">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="showIcon" align-self="center" cols="2"><tapestry-icon :icon="type"/></b-col>
      <b-col v-if="type === 'text'" align-self="center">
        <div class="text">
          {{ answerData }}
        </div>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="answerData"></audio>
      </b-col>
      <b-col v-if="type === 'tasks'" align-self="center">
      <ul v-if="followUpQuestion.answerTypes.multipleChoice.hasMultipleAnswers">
        <li v-for="answer in answerData" :key="answer.index">
          <previous-activity-choice-row
            :item="getMultipleChoiceOptionObject(answer)"
            :useImages="followUpQuestion.answerTypes.multipleChoice.useImages"
          />
        </li>
      </ul>
      <ul v-else>
        <li>
          <previous-activity-choice-row
            :item="getRadioMultipleChoiceOptionObject(answerData)"
            :useImages="followUpQuestion.answerTypes.multipleChoice.useImages"
          />
        </li>
      </ul>
    </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import PreviousActivityChoiceRow from "./PreviousActivityChoiceRow.vue"

export default {
  name: "tapestry-activity",
  components: {
    TapestryIcon,
    PreviousActivityChoiceRow,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio", "tasks"].includes(val),
    },
    answerData: {
      type: [String, Array, Number],
      required: true,
    },
    followUpQuestion: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    showIcon: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  methods: {
    getMultipleChoiceOptionObject(id) {
      for (
        let i = 0;
        i < this.followUpQuestion.answerTypes.multipleChoice.checkboxArray.length;
        i++
      ) {
        if (
          this.followUpQuestion.answerTypes.multipleChoice.checkboxArray[i].id === id
        ) {
          return this.followUpQuestion.answerTypes.multipleChoice.checkboxArray[i]
        }
      }
    },
    getRadioMultipleChoiceOptionObject(id) {
      for (
        let i = 0;
        i < this.followUpQuestion.answerTypes.multipleChoice.radioArray.length;
        i++
      ) {
        if (
          this.followUpQuestion.answerTypes.multipleChoice.radioArray[i].id === id
        ) {
          return this.followUpQuestion.answerTypes.multipleChoice.radioArray[i]
        }
      }
  },
}
</script>

<style lang="scss" scoped>
.tapestry-activity {
  background: #262626;
  border-radius: 0 0 8px 8px;
  margin-bottom: 8px;
  padding: 8px 16px 8px 16px;

  .text{
    text-align: left;
  }

}
</style>
