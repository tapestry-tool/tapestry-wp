<template>
  <b-container class="completed-activity-media">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="type === 'text' && !isListTextType" align-self="center">
        <div class="text">
          {{ answerData[0] }}
        </div>
      </b-col>
      <b-col v-if="type === 'text' && isListTextType">
        <ol>
          <li v-for="answer in answerData" :key="answer.index">
            {{ answer }}
          </li>
        </ol>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="urlAnswer"></audio>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex"
import { data as wpData } from "@/services/wp"

export default {
  name: "completed-activity-media",
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio"].includes(val),
    },
    node: {
      type: Object,
      required: true,
    },
    answerData: {
      type: [Object, String],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getQuestion"]),
    question() {
      return this.getQuestion(this.node.typeData.questionId)
    },
    isListTextType() {
      return this.question.answerTypes.text.allowMultiple
     },
    urlAnswer() {
      return (
        wpData.uploadDirArray.baseurl + "/" + this.answerData.url + "?" + Date.now()
      )
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
