<template>
  <div class="px-3 mt-n2">
    <b-overlay variant="white">
      <b-row>
        <b-col cols="6">
          <div>
            <b-form-group data-qa="select-activity" label="Activity">
              <combobox
                v-model="activityId"
                :options="activityNodes"
                data-qa="choose-activity"
                item-text="title"
                item-value="id"
                empty-message="Please select an activity first"
              >
                <template v-slot="slotProps">
                  <p>
                    {{ slotProps.option.title }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
            <b-form-group data-qa="select-question" label="Question">
              <combobox
                v-model="questionId"
                :options="availableQuestions"
                data-qa="choose-question"
                item-text="text"
                item-value="id"
                empty-message="Please select an activity first."
              >
                <template v-slot="slotProps">
                  <p>
                    {{ slotProps.option.text }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
          </div>
        </b-col>
        <b-col class="ml-3" cols="4">
          <b-form-group
            label="Export Answers"
            description="Export answers of all users for all activities and questions to an Excel or CSV file."
          >
            <b-row>
              <b-form-checkbox
                v-model="exportToCsv"
                data-qa="export-answer-button"
                :value="true"
                :unchecked-value="false"
                switch
              >
                <span>
                  {{ exportToCsv ? "CSV" : "Excel" }}
                </span>
              </b-form-checkbox>
            </b-row>
            <b-row class="mb-2">
              <b-button block variant="light" @click="exportAnswers">
                Export Answers
              </b-button>
            </b-row>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-if="questionId">
          <b-table responsive bordered :fields="fields" :items="userAnswers">
            <template #cell(text)="text">
              <completed-activity-media
                :type="`text`"
                :answerData="text.value"
                :question="question"
              ></completed-activity-media>
            </template>
            <template #cell(audio)="audio">
              <completed-activity-media
                :type="`audio`"
                :answerData="audio.value"
                :question="question"
              ></completed-activity-media>
            </template>
            <template #cell(dragDrop)="dragDrop">
              <completed-activity-media
                :type="`dragDrop`"
                :answerData="dragDrop.value"
                :question="question"
              ></completed-activity-media>
            </template>
            <template #cell(multipleChoice)="multipleChoice">
              <completed-activity-media
                :type="`multipleChoice`"
                :answerData="multipleChoice.value"
                :question="question"
              ></completed-activity-media>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import XLSX from "xlsx"
import client from "@/services/TapestryAPI"
import Combobox from "@/components/modals/common/Combobox"
import CompletedActivityMedia from "@/components/Lightbox/media/common/CompletedActivityMedia"

export default {
  name: "user-answers-form",
  components: {
    Combobox,
    CompletedActivityMedia,
  },
  props: {},
  data() {
    return {
      activityId: null,
      questionId: null,
      userAnswers: [],
      exportToCsv: false,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapGetters(["getNode", "getAnswers", "getQuestion"]),
    activityNode() {
      return this.getNode(this.activityId)
    },
    question() {
      return this.availableQuestions.find(
        question => question.id === this.questionId
      )
    },
    activityNodes() {
      return Object.values(this.nodes).filter(node => node.mediaType == "activity")
    },
    availableQuestions() {
      return Object.values(this.activityNodes)
        .filter(node => node.id == this.activityId)
        .flatMap(node => node.typeData.activity.questions)
    },
    fields() {
      return Object.keys(this.userAnswers) > 0 ? Object.keys(this.userAnswers) : []
    },
  },
  watch: {
    questionId(questionId) {
      client.getAllUsersAnswers(this.activityId, questionId).then(response => {
        this.userAnswers = response.data
      })
    },
  },
  methods: {
    exportAnswers() {
      let workBook = XLSX.utils.book_new()
      this.activityNodes.forEach(activityNode => {
        const activityAnswers = this.formatActivityAnswers(activityNode)
        const answerSheet = XLSX.utils.json_to_sheet(activityAnswers)
        XLSX.utils.book_append_sheet(workBook, answerSheet)
      })
      this.exportToCsv
        ? XLSX.writeFile(workBook, "answers.csv")
        : XLSX.writeFile(workBook, "answers.xlsx")
    },
    async formatActivityAnswers(activity) {
      let formattedAnswers = []
      const questions = activity.typeData.activity.questions
      questions.forEach(question => {
        const userAnswers = client.getAllUsersAnswers(activity.id, question.id)
        console.log(userAnswers + "are the user answers")
        userAnswers.forEach(userAnswer => {
          let newAnswer = {
            question: question.text,
            userId: userAnswer.ID,
            displayName: userAnswer.display_name,
            text: userAnswer.text?.join(),
            audio: userAnswer.audio?.url,
            multipleChoice: userAnswer.multipleChoice
              ? this.formatMultipleChoiceAnswers(userAnswer.multipleChoice)
              : "",
          }
          formattedAnswers.push(newAnswer)
        })
      })
      console.log(formattedAnswers + "are the formatted answers")
      return formattedAnswers
    },
    // async formatQuestionAnswers(question) {
    //   // Promise.resolve(client.getAllUsersAnswers(activity.id, question.id)).then(
    //   //   response => {
    //   //     const userAnswers = response.data
    //   //     console.log(userAnswers + "are the user answers")
    //   //     userAnswers.forEach(userAnswer => {
    //   //       let newAnswer = {
    //   //         question: question.text,
    //   //         userId: userAnswer.ID,
    //   //         displayName: userAnswer.display_name,
    //   //         text: userAnswer.text?.join(),
    //   //         audio: userAnswer.audio?.url,
    //   //         multipleChoice: userAnswer.multipleChoice
    //   //           ? this.formatMultipleChoiceAnswers(userAnswer.multipleChoice)
    //   //           : "",
    //   //       }
    //   //       formattedAnswers.push(newAnswer)
    //   //     })
    //   //   }
    //   // )
    // },
    formatAnswers2(question) {
      let formattedAnswers = []
      question.forEach(userAnswer => {
        let newAnswer = {
          userId: userAnswer.ID,
          displayName: userAnswer.display_name,
          text: userAnswer.text?.join(),
          audio: userAnswer.audio?.url,
          multipleChoice: userAnswer.multipleChoice
            ? this.formatMultipleChoiceAnswers(userAnswer.multipleChoice)
            : "",
        }
        formattedAnswers.push(newAnswer)
      })
      console.log(formattedAnswers)
      return formattedAnswers
    },
    exportAnswers2() {
      let newWorkBook = XLSX.utils.book_new()
      const formattedAnswers = this.formatAnswers()
      const answerSheet = XLSX.utils.json_to_sheet(formattedAnswers)
      XLSX.utils.book_append_sheet(newWorkBook, answerSheet, "User Answers")
      this.exportToCsv
        ? XLSX.writeFile(newWorkBook, "answers.csv")
        : XLSX.writeFile(newWorkBook, "answers.xlsx")
    },
    formatMultipleChoiceAnswers(mcAnswers) {
      let answerValues = []
      mcAnswers.forEach(choice => {
        let answer = this.question.answerTypes.multipleChoice.choices.find(
          option => option.id === choice
        )
        answerValues.push(answer.value)
      })
      return answerValues.join()
    },
  },
}
</script>
