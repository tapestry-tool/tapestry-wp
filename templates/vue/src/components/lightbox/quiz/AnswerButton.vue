<template>
  <button :disabled="disabled" class="button" @click="$emit('click')">
    <div v-if="isFaIcon" class="icon">
      <i :class="`fas fa-${icon} icon-fa`"></i>
    </div>
    <img v-else :src="textIcon" class="icon" />
    <slot></slot>
  </button>
</template>

<script>
import TextIcon from "../../../assets/Aa.svg"

export default {
  name: "answer-button",
  props: {
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
.button {
  padding: 0;
  margin: 0;
  background-color: var(--tyde-orange);
  color: white;
  width: 136px;
  height: 144px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.1s ease-out;
  margin-right: 24px;

  &:last-child,
  &:only-child {
    margin-right: 0;
  }

  &:hover {
    background-color: var(--tyde-orange-light);
  }
}

.icon {
  height: 56px;
  margin-bottom: 16px;

  &-fa {
    font-size: 56px;
  }
}
</style>
