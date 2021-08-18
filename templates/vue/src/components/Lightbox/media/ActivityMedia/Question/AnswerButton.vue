<template>
  <button class="button" :disabled="disabled" @click="$emit('click')">
    <i
      class="fas fa-check-circle m-1 mb-3"
      :class="completed ? 'visible' : 'invisible'"
    ></i>
    <div v-if="isFaIcon" class="icon">
      <i :class="`fas fa-${faIcon} icon-fa`"></i>
    </div>
    <drag-drop-icon
      v-else-if="icon === 'dragDrop'"
      class="drag-drop-icon"
      width="56"
      height="56"
    />
    <img v-else :src="textIcon" class="icon" />
    <div>
      <slot></slot>
    </div>
  </button>
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import { data } from "@/services/wp"
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

        default:
          return this.icon
      }
    },
    isFaIcon() {
      return this.faIcon === "tasks" || this.faIcon === "microphone"
    },
    textIcon() {
      return `${data.vue_uri}/${TextIcon.split("dist")[1]}`
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  padding: 0;
  margin: 0;
  margin-right: 24px;
  background: black;
  &:last-child,
  &:only-child {
    margin-right: 0;
  }
}

.button {
  padding: 0;
  background-color: #262626;
  color: white;
  width: 136px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.icon {
  height: 56px;

  &-fa {
    font-size: 56px;
  }
}

.drag-drop-icon {
  fill: transparent;
}

.container {
  height: 56px;
  img {
    margin-top: -30px;
  }
}
</style>
