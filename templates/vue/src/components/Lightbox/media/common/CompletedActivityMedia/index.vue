<template>
  <b-container class="completed-activity-media">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="type === 'text'" align-self="center">
        <div class="text">
          {{ answerData }}
        </div>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="urlAnswer"></audio>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { data as wpData } from "@/services/wp"

export default {
  name: "completed-activity-media",
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio"].includes(val),
    },
    answerData: {
      type: [Object],
      required: true,
    },
  },
  computed:{
    urlAnswer() {
      return wpData.uploadDirArray.baseurl + "/" + this.answerData.url + "?" + Date.now()
    }
  }
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
