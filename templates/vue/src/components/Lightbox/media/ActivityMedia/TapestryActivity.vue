<template>
  <b-container class="tapestry-activity">
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
        <audio controls :src="answerData"></audio>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  name: "tapestry-activity",
  components: {
    TapestryIcon,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio"].includes(val),
    },
    answerData: {
      type: [String, Array],
      required: true,
    },
    showIcon: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-activity {
  background: #262626;
  border-radius: 0 0 8px 8px;
  margin-bottom: 8px;
  padding: 8px 16px 8px 16px;

  .text {
    text-align: left;
  }
}
</style>
