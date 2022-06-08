<template>
  <div>
    <b-form-group data-qa="activity-combobox" label="Activity">
      <combobox
        :value="typeData.activityId"
        :options="activityNodes"
        data-qa="choose-activity-node"
        item-text="title"
        item-value="id"
        empty-message="Please select an Activity first"
        @input="update('typeData.activityId', $event)"
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group data-qa="question-select" label="Question">
      <combobox
        :value="typeData.questionId"
        :options="availableQuestions"
        data-qa="choose-question"
        item-text="text"
        item-value="id"
        empty-message="Please select an activity first."
        @input="update('typeData.questionId', $event)"
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.text }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group label="Show this text first">
      <b-form-input
        v-if="typeData.questionId"
        :value="typeData.precedingText"
        data-qa="follow-up-text"
        :placeholder="originalQuestionText"
        description="If empty, will default to the original question text"
        @input="update('typeData.precedingText', $event)"
      ></b-form-input>
    </b-form-group>
    <b-form-checkbox
      :checked="typeData.isEditable"
      @input="update('typeData.isEditable', $event)"
    >
      Allow user to edit this answer
    </b-form-checkbox>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import Combobox from "@/components/modals/common/Combobox"
export default {
  components: {
    Combobox,
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapState({
      typeData: state => state.currentEditingNode.typeData,
    }),
    activityNodes() {
      return Object.values(this.nodes).filter(node => node.mediaType == "activity")
    },
    availableQuestions() {
      return this.activityNodes
        .filter(node => node.id == this.typeData.activityId)
        .flatMap(node => node.typeData.activity.questions)
    },
    originalQuestionText() {
      return this.availableQuestions.find(
        question => question.id === this.typeData.questionId
      )?.text
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
  },
}
</script>
