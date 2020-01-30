<template>
  <button :disabled="disabled" @click="$emit('click')">
    <span class="button">
      <i
        class="fas fa-check-circle"
        :class="completed ? 'visible' : 'invisible'"
      ></i>
      <div v-if="isFaIcon" class="icon">
        <i :class="`fas fa-${icon} icon-fa`"></i>
      </div>
      <img v-else :src="textIcon" class="icon" />
      <div>
        <slot></slot>
      </div>
    </span>
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
  background: #fff;
  padding: 0;
  margin: 0;
  margin-right: 16px;
  &:last-child,
  &:only-child {
    margin-right: 0;
  }
}

.button {
  padding: 0;
  background-color: var(--tyde-orange);
  color: white;
  width: 136px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  font-size: 24px;
  transition: all 0.1s ease-out;

  i {
    color: white;

    &:first-of-type {
      align-self: flex-end;
    }
  }

  &:hover {
    background-color: var(--tyde-orange-light);
  }

  > * {
    margin-bottom: 16px;
  }
}

.icon {
  height: 56px;

  &-fa {
    font-size: 56px;
  }
}
</style>
