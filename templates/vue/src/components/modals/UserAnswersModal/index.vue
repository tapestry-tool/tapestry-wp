<template>
  <b-modal
    id="user-answers-modal"
    class="xl-modal"
    data-qa="user-answers-modal"
    :visible="show"
    size="xl"
    title="User Answers"
    scrollable
    body-class="p-0"
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Answers"
          :active="tab === 'answers'"
          @click="$emit('change:tab', 'answers')"
        >
          <div class="px-3 mt-n2">
            <b-overlay variant="white">
              <b-row>
                <b-col cols="12">
                  <div>
                    <b-form-group data-qa="select-activity" label="Activity">
                      <combobox
                        v-model="activityId"
                        :options="activityNodes"
                        data-qa="choose-activity"
                        item-text="title"
                        item-value="id"
                        empty-message="There are no activities in this Tapestry."
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
              </b-row>
              <b-row>
                <b-col v-if="questionId">
                  <b-table
                    responsive
                    bordered
                    :fields="fields"
                    :items="questionAnswers"
                    show-empty
                    empty-text="This question has not been answered by any user."
                    data-qa="question-answers-table"
                  >
                    <template #cell(text)="text">
                      <completed-activity-media
                        v-if="text.value"
                        :type="`text`"
                        :answerData="text.value"
                        :question="question"
                      ></completed-activity-media>
                    </template>
                    <template #cell(audio)="audio">
                      <completed-activity-media
                        v-if="audio.value"
                        :type="`audio`"
                        :answerData="audio.value"
                        :question="question"
                      ></completed-activity-media>
                    </template>
                    <template #cell(dragDrop)="dragDrop">
                      <completed-activity-media
                        v-if="dragDrop.value"
                        :type="`dragDrop`"
                        :answerData="dragDrop.value"
                        :question="question"
                      ></completed-activity-media>
                    </template>
                    <template #cell(multipleChoice)="multipleChoice">
                      <completed-activity-media
                        v-if="multipleChoice.value"
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
        </b-tab>
        <b-tab
          title="Export"
          :active="tab === 'export'"
          @click="$emit('change:tab', 'export')"
        >
          <b-form-group
            label="Export All User Answers"
            description="Export answers of all users for all activities and questions in the Tapestry to an Excel file."
          >
            <b-button block variant="light" @click="exportAnswers">
              Export Answers
            </b-button>
          </b-form-group>
        </b-tab>
      </b-tabs>
    </b-container>
  </b-modal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import XLSX from "xlsx"
import client from "@/services/TapestryAPI"
import Combobox from "@/components/modals/common/Combobox"
import CompletedActivityMedia from "@/components/Lightbox/media/common/CompletedActivityMedia"
import DragSelectModular from "@/utils/dragSelectModular"

export default {
  name: "user-answers-modal",
  components: {
    Combobox,
    CompletedActivityMedia,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    tab: {
      type: String,
      required: false,
      default: "answers",
    },
  },
  data() {
    return {
      activityId: null,
      questionId: null,
      allAnswers: null,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapGetters(["getNode", "getQuestion"]),
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
      let fields = new Set()
      for (const response of this.allAnswers[this.activityId][this.questionId]) {
        for (const key of Object.keys(response)) {
          fields.add(key)
        }
      }
      return [...fields]
    },
    questionAnswers() {
      return this.allAnswers[this.activityId][this.questionId].filter(
        row => row.text || row.audio || row.multipleChoice || row.dragDrop
      )
    },
  },
  watch: {
    activityId() {
      this.questionId = null
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", (_, modalId) => {
      if (modalId === "user-answers-modal") {
        DragSelectModular.removeDragSelectListener()
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId === "user-answers-modal") {
        DragSelectModular.addDragSelectListener()
        this.$emit("close")
      }
    })
    client.getAllUsersAnswers(this.activityId).then(response => {
      this.allAnswers = response.data
    })
  },
  methods: {
    closeModal() {
      this.$emit("close")
    },
    exportAnswers() {
      let newWorkBook = XLSX.utils.book_new()
      const wscols = [
        { wch: 30 },
        { wch: 10 },
        { wch: 20 },
        { wch: 25 },
        { wch: 50 },
        { wch: 15 },
        { wch: 50 },
      ]
      this.activityNodes.forEach(activity => {
        const formattedAnswers = this.formatAnswers(activity.id)
        const answerSheet = XLSX.utils.json_to_sheet(formattedAnswers)
        answerSheet["!cols"] = wscols
        XLSX.utils.book_append_sheet(newWorkBook, answerSheet, `${activity.title}`)
      })
      XLSX.writeFile(newWorkBook, "answers.xlsx")
    },
    formatAnswers(activityId) {
      let formattedAnswers = []
      const activity = this.allAnswers[activityId]
      const questionIds = Object.keys(activity)
      questionIds.forEach(questionId => {
        let question = this.getQuestion(questionId)
        const questionAnswers = activity[questionId]
        questionAnswers.forEach(userAnswer => {
          let newAnswer = {
            question: question.text,
            userId: userAnswer.ID,
            displayName: userAnswer.display_name,
            text: userAnswer.text
              ? Array.isArray(userAnswer.text)
                ? userAnswer.text.join()
                : userAnswer.text
              : "",
            audio: userAnswer.audio?.url,
            multipleChoice: this.formatMultipleChoiceAnswers(
              userAnswer.multipleChoice,
              question
            ),
            dragDrop: this.formatDragDropAnswers(userAnswer.dragDrop, question),
          }
          formattedAnswers.push(newAnswer)
        })
        formattedAnswers.push({ "": "" })
      })
      return formattedAnswers
    },
    formatMultipleChoiceAnswers(answers, question) {
      if (!answers) return ""
      let answerValues = []
      answers.forEach(choice => {
        let answer = question.answerTypes.multipleChoice.choices.find(
          option => option.id === choice
        )
        answerValues.push(answer.value)
      })
      return answerValues.join()
    },
    formatDragDropAnswers(answers, question) {
      if (!answers) return ""
      let dragDropInfo = question.answerTypes.dragDrop
      let answerValues = []
      let bucketInfo = {}
      let itemInfo = {}
      dragDropInfo.buckets.forEach(bucket => {
        bucketInfo[bucket.id] = bucket.text
      })
      dragDropInfo.items.forEach(item => {
        itemInfo[item.id] = item.text
      })
      answers.forEach(answer => {
        if (answer.items.length > 0) {
          let bucketName = bucketInfo[answer.bucketId]
          let itemNames = answer.items.map(item => itemInfo[item])
          let answerValue = `${bucketName}: ` + itemNames.join(",")
          answerValues.push(answerValue)
        }
      })
      return answerValues.join("|")
    },
  },
}
</script>
