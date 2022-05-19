<template>
  <button class="button" :disabled="disabled" @click="$emit('click')">
    <i class="fas fa-check-circle" :class="completed ? 'visible' : 'invisible'"></i>
    <div v-if="isFaIcon" class="icon">
      <i :class="`fas fa-${faIcon} icon-fa`"></i>
    </div>
    <drag-drop-icon
      v-else-if="icon === 'dragDrop'"
      class="drag-drop-icon"
      width="56"
      height="56"
    />
    <slot></slot>
  </button>
</template>

<script>
import DragDropIcon from "@/components/common/TapestryIcon/DragDropIcon.vue"

export default {
  name: "answer-button",
  components: { DragDropIcon },
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
    faIcon() {
      switch (this.icon) {
        case "multipleChoice":
          return "tasks"
        case "audio":
          return "microphone"
        case "text":
          return "keyboard"
        default:
          return this.icon
      }
    },
    isFaIcon() {
      return (
        this.faIcon === "tasks" ||
        this.faIcon === "microphone" ||
        this.faIcon === "keyboard" ||
        this.faIcon === "font"
      )
    },
  },
}
</script>

<style lang="scss" scoped>
button,
button:active,
button:focus {
  background: var(--text-color-primary);
  color: var(--bg-color-primary);
  padding: 0;
  margin: 0;
  margin-right: 24px;
  &:last-child,
  &:only-child {
    margin-right: 0;
  }
}

.button {
  padding: 0;
  padding-bottom: 20px;
  width: 136px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24px;
  transition: all 0.1s ease-out;

  i {
    &:first-of-type {
      align-self: flex-end;
    }
  }

  &:hover {
    background-color: var(--highlight-color);
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

.container {
  height: 56px;
  img {
    margin-top: -30px;
  }
}
</style>
