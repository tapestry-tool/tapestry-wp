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
            description="Export answers of all users to an Excel or CSV file."
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
          <b-table responsive bordered :fields="answerFields" :items="userAnswers">
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
    answerFields() {
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
      return
    },
  },
}
</script>
