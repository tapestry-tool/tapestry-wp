<template>
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
      </b-row>
      <b-row>
        <b-col>
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
}
</script>
