<template>
  <i
    v-if="icon === 'audio' || icon === 'checklist'"
    :class="`fas fa-${iconSrc} icon-fa`"
  ></i>
  <img v-else :src="iconSrc" />
</template>

<script>
import TextIcon from "@/assets/Aa.svg"
import Checkmark from "@/assets/checkmark.png"
import LockIcon from "@/assets/lock-icon.png"
import ActivityIcon from "@/assets/activity-icon.png"
import Helpers from "@/utils/Helpers"

export default {
  name: "tyde-icon",
  props: {
    icon: {
      type: String,
      required: true,
      validator: prop =>
        ["audio", "checklist", "text", "checkmark", "lock", "activity"].includes(
          prop
        ),
    },
  },
  computed: {
    iconSrc() {
      const icons = {
        audio: "microphone",
        checklist: "tasks",
        text: Helpers.getImagePath(TextIcon),
        checkmark: Helpers.getImagePath(Checkmark),
        lock: Helpers.getImagePath(LockIcon),
        activity: Helpers.getImagePath(ActivityIcon),
      }
      return icons[this.icon]
    },
  },
}
</script>
