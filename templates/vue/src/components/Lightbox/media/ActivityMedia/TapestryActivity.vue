<template>
  <div class="tapestry-activity">
    <div class="icon"><tapestry-icon :icon="type" /></div>
    <div v-if="type === 'text'" class="text">{{ answerData }}</div>
    <audio v-if="type === 'audio'" controls :src="answerData"></audio>
    <div v-if="type === 'tasks'">
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
    </div>
  </div>
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
  },
}
</script>

<style lang="scss" scoped>
.tapestry-activity {
  position: relative;
  align-items: center;
  background: #262626;
  border-radius: 8px;
  display: flex;
  margin-bottom: 8px;
  padding: 8px 16px 8px 38px;
  justify-content: center;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    height: 24px;
    width: 24px;
    position: absolute;
    left: 8px;
  }

  * {
    margin: 0;
    padding: 0;
  }
}

.text {
  white-space: pre-wrap;
}
</style>
