<template>
  <div class="px-3 mt-n2">
    <b-overlay variant="white">
      <b-row>
        <b-col cols="9">
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
          <b-table
            responsive
            bordered
            fixed
            :items="items"
            :fields="fields"
          ></b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import client from "@/services/TapestryAPI"
import Combobox from "@/components/modals/common/Combobox"
// import { data } from "@/services/wp"

export default {
  name: "user-answers-form",
  components: {
    Combobox,
  },
  props: {},
  data() {
    return {
      activityId: null,
      questionId: null,
      // turn into computed property
      fields: ["ID", "user", "text", "audio", "multiple_choice", "drag_and_drop"],
      // turn into computed property
      items: [
        {
          id: "4",
          user: "User Name",
          text: 40,
          audio: "Dickerson",
          multiple_choice: "Macdonald",
          drag_and_drop: "Yes",
        },
      ],
    }
  },
  computed: {
    ...mapState(["nodes", "userAnswers"]),
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
    // userAnswers() {
    //   return this.userAnswers
    // },
  },
  watch: {
    questionId(questionId) {
      client.getAllUsersAnswers(this.activityId, questionId)
      console.log("called getALlUsersAnswers")
    },
  },
  mounted() {},
}
</script>
