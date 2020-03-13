<template>
  <div class="activity mb-3 py-4">
    <h4 class="mb-3">{{ activity.text }}</h4>
    <div v-for="(answer, idx) in answers" :key="idx" class="answer">
      <div class="icon">
        <tyde-icon :icon="answer.icon" style="color: inherit;"></tyde-icon>
      </div>
      <div class="answer-entry">
        <h4>You answered:</h4>
        <div v-html="answer.entry"></div>
      </div>
    </div>
  </div>
</template>

<script>
import TydeIcon from "./TydeIcon"

export default {
  name: "tyde-activity-summary",
  components: {
    TydeIcon,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  computed: {
    answers() {
      const entries = Object.entries(this.activity.entries)
      return entries.map(entry => ({
        icon: this.getIcon(entry),
        entry: this.formatEntry(this.getEntry(entry)),
      }))
    },
  },
  methods: {
    formatEntry(entry) {
      if (entry.length === 1) {
        return entry[0]
      }
      const ul = document.createElement("ul")
      entry.forEach(answer => {
        const listItem = document.createElement("li")
        listItem.innerText = answer
        ul.appendChild(listItem)
      })
      return ul.outerHTML
    },
    getEntry(answer) {
      const validEntries = Object.entries(answer[1]).filter(entry => {
        const val = parseInt(entry[0])
        return !isNaN(val)
      })
      return validEntries.map(i => i[1])
    },
    getIcon(answer) {
      const entry = this.getEntry(answer)
      if (entry.length === 1) {
        return "text"
      } else if (entry.length > 1) {
        return "checklist"
      }
      return answer[0].substring(0, answer[0].length - 2)
    },
  },
}
</script>

<style lang="scss">
.answer .answer-entry ul {
  margin-bottom: 0;
}
</style>

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

.activity {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  padding: 16px 32px;

  * {
    text-align: left;
  }
}

.answer {
  display: flex;
  margin-bottom: 1rem;

  .icon {
    width: 96px;
    height: 96px;
    font-size: 56px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    background: $tyde-orange;
    border-radius: 16px;

    img {
      width: 70%;
    }
  }
}
</style>
