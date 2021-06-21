<template>
  <div class="tapestry-activity">
    <div class="icon"><tapestry-icon :icon="type" /></div>
    <div v-if="type === 'text'" class="text">{{ answerData }}</div>
    <audio v-if="type === 'audio'" controls :src="answerData"></audio>
    <div v-if="type === 'drag drop'" class="dragdropicon">
      <img :src="dragDropIcon" />
    </div>
    <div v-if="type === 'drag drop'" class="text">
      {{ entry }}
    </div>
  </div>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import DragDropIcon from "@/assets/icons/drag_drop.svg"
import { data } from "@/services/wp"

export default {
  name: "tapestry-activity",
  components: {
    TapestryIcon,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "audio", "drag drop"].includes(val),
    },
    answerData: {
      type: [String, Array],
      required: true,
    },
  },
  computed: {
    dragDropIcon() {
      return `${data.vue_uri}/${DragDropIcon.split("dist")[1]}`
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-activity {
  position: relative;
  align-items: center;
  background: #262626;
  border-radius: 8px;
  display: flex;
  margin-bottom: 8px;
  padding: 8px 16px 8px 38px;
  justify-content: center;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    height: 24px;
    width: 24px;
    position: absolute;
    left: 8px;
  }

  * {
    margin: 0;
    padding: 0;
  }
}

.text {
  white-space: pre-wrap;
}

.dragdropicon {
  height: 30px;
  width: 30px;
  position: absolute;
  left: 8px;
}
</style>
