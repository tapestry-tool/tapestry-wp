<template>
  <div class="activity mb-3 py-4">
    <h4 class="mb-3">{{ activity.text }}</h4>
    <div v-for="(answer, idx) in answers" :key="idx" class="answer">
      <div class="icon">
        <tyde-icon :icon="answer.icon" style="color: inherit;"></tyde-icon>
      </div>
      <div class="answer-entry">
        <h4>
          {{ activity.userType === "copilot" ? "You" : "Your teen" }} answered:
        </h4>
        <div
          v-if="answer.icon !== 'audio' && answer.icon !== 'checklist'"
          v-html="answer.entryHTML"
        ></div>
        <ul v-if="answer.icon === 'checklist'" class="checklist">
          <li v-for="(choice, index) in answer.entry" :key="index">
            <img :src="choice.imageUrl" />
            {{ choice.choiceText }}
          </li>
        </ul>
        <audio v-if="answer.icon === 'audio'" controls></audio>
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
        entry: this.getEntry(entry).map(i => i[1]),
        entryHTML: this.formatEntry(this.getEntry(entry).map(i => i[1])),
      }))
    },
  },
  mounted() {
    const entries = Object.entries(this.activity.entries)
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
      if (answer[0] === "audioId") {
        return answer
      }
      return Object.entries(answer[1]).filter(entry => {
        const val = parseInt(entry[0])
        return !isNaN(val)
      })
    },
    getIcon(answer) {
      const entry = this.getEntry(answer)
      if (entry.length) {
        if (entry[0] === "audioId") {
          return "audio"
        }
        const id = entry[0][0]
        return this.isDecimal(id) ? "checklist" : "text"
      }
    },
    isDecimal(str) {
      return str % 1 != 0
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

  h4 {
    font-size: 1.8em;
  }

  *:not(.fas) {
    text-align: left;
    font-family: inherit;
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
    background: var(--tyde-border-green);
    border-radius: 16px;

    img {
      width: 70%;
    }
  }

  .answer-entry > ul {
    list-style-type: none;
    padding-left: 0;

    > li {
      margin-top: 0.5em;

      > img {
        height: 75px;
        width: auto;
        margin-right: 0.5em;
      }
    }
  }
}
</style>
