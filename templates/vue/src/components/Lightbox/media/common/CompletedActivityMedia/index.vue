<template>
  <b-container class="completed-activity-media">
    <b-row align-v="center" style="min-height:150px;">
      <b-col v-if="showIcon" align-self="center" cols="2">
        <tapestry-icon :icon="type" />
      </b-col>
      <b-col v-if="type === 'text'" align-self="center">
        <div class="text">
          {{ answerData }}
        </div>
      </b-col>
      <b-col v-if="type === 'audio'" align-self="center">
        <audio controls :src="urlAnswer"></audio>
      </b-col>
      <b-col v-if="type === 'dragDrop'" align-self="center">
        <drag-drop
          :answer-data="answerData"
          :drag-drop="question.answerTypes.dragDrop"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import DragDrop from "./DragDrop"
import TapestryIcon from "@/components/common/TapestryIcon"
import { data as wpData } from "@/services/wp"

export default {
  name: "completed-activity-media",
  components: {
    TapestryIcon,
    DragDrop,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio", "dragDrop"].includes(val),
    },
    answerData: {
      type: [String, Array, Object],
      required: true,
    },
    question: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    showIcon: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  computed: {
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
  padding: 8px 16px 8px 16px;
  .text {
    text-align: left;
    padding-left: 1em;
    border-left: solid 1px #666;
  }
}

.dragdropicon {
  height: 30px;
  width: 30px;
}
</style>
