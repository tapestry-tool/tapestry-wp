<template>
  <button class="answer-button" :disabled="disabled" @click="$emit('click')">
    <i class="fas fa-check-circle" :class="completed ? 'visible' : 'invisible'"></i>
    <div v-if="isFaIcon" class="answer-button-icon">
      <i :class="`fas fa-${icon} answer-button-icon-fa`"></i>
    </div>
    <img v-else :src="textIcon" class="answer-button-icon" />
    <div>
      <slot></slot>
    </div>
  </button>
</template>

<script>
import TextIcon from "../../../assets/Aa.svg"

export default {
  name: "answer-button",
  props: {
    completed: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    icon: {
      type: String,
      required: false,
      default: "text",
    },
  },
  computed: {
    isFaIcon() {
      return this.icon === "tasks" || this.icon === "microphone"
    },
    textIcon() {
      return `${wpData.vue_uri}/${TextIcon.split("dist")[1]}`
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  padding: 0;
  margin: 0;
  margin-right: 16px;
  &:last-child,
  &:only-child {
    margin-right: 0;
  }
}

.answer-button {
  padding: 0;
  background-color: #262626;
  color: white;
  width: 136px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: normal;
  font-size: 24px;
  transition: all 0.1s ease-out;

  i {
    color: white;

    &:first-of-type {
      align-self: flex-end;
    }
  }

  &:hover {
    background-color: #11a6d8;
  }

  > * {
    margin-bottom: 16px;
  }
}

.answer-button-icon {
  height: 56px;

  &-fa {
    font-size: 56px;
  }
}
</style>
