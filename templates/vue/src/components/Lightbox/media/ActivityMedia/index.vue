<template>
  <div ref="activity" class="activity-media" :class="`context-${context}`">
    <h1 v-if="showTitle" class="media-title">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <completion-screen
      v-if="state === 'completion-screen'"
      :question="activeQuestion"
    >
      <button class="button-completion" @click="close">
        <template
          v-if="context === 'lightbox' && nextUnansweredQuestionIndex === -1"
        >
          <i class="fas fa-times-circle fa-4x"></i>
          <p>Done</p>
        </template>
        <template v-else>
          <i class="fas fa-arrow-circle-right fa-4x"></i>
          <p>Continue</p>
        </template>
      </button>
    </completion-screen>
    <question
      v-else-if="state === 'activity'"
      :question="activeQuestion"
      :node="questionNode"
      @before-submit="scrollToTop('instant')"
      @submit="handleComplete('activity')"
      @skip-question="skip"
      @back="$emit('close')"
    ></question>
    <answer-media
      v-else-if="state === 'answer'"
      :node="node"
      :type-data="currentQuestionTypeData"
      @complete="handleComplete('answer')"
      @close="$emit('close')"
      @load="$emit('load', $event)"
    ></answer-media>
    <footer class="question-footer">
      <template v-if="state !== 'completion-screen'">
        <b-button
          v-if="hasAnswers && state === 'activity'"
          variant="info"
          class="mr-auto"
          @click="state = 'answer'"
        >
          Show previous answers
        </b-button>
        <b-button
          v-else-if="canChangeAnswer && state === 'answer'"
          variant="info"
          class="mr-auto"
          @click="state = 'activity'"
        >
          Change answers
        </b-button>
        <template v-if="initialType === 'activity'">
          <p class="question-step">{{ currentQuestionText }}</p>
          <button
            v-if="questions.length > 1"
            class="button-nav"
            :disabled="!hasPrev"
            data-qa="question-prev-button"
            @click="prev"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <button
            v-if="questions.length > 1"
            class="button-nav"
            :disabled="!hasNext"
            data-qa="question-next-button"
            @click="next"
          >
            <i class="fas fa-arrow-right"></i>
          </button>
        </template>
      </template>
    </footer>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import Question from "./Question"
import CompletionScreen from "./CompletionScreen"
import CompletedIcon from "@/components/common/CompletedIcon"
import { mapActions, mapGetters } from "vuex"
import AnswerMedia from "./AnswerMedia.vue"
import Helpers from "@/utils/Helpers"

const states = {
  ACTIVITY: "activity",
  ANSWER: "answer",
  COMPLETION_SCREEN: "completion-screen",
}

export default {
  name: "activity-media",
  components: {
    CompletionScreen,
    CompletedIcon,
    Question,
    AnswerMedia,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: false,
      default: "",
    },
    initialType: {
      type: String,
      required: true,
    },
    hideTitle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      activeQuestionIndex: 0,
      state: "",
    }
  },
  computed: {
    ...mapGetters(["getAnswers", "getQuestion", "getNode"]),
    questionNode() {
      return this.initialType === states.ACTIVITY
        ? this.node
        : this.getNode(this.node.typeData.activityId)
    },
    showTitle() {
      return (
        !this.hideTitle &&
        this.context === "multi-content" &&
        this.node.typeData.showTitle !== false
      )
    },
    questions() {
      /* NOTE: If this is an answer node we retreive the single question
       *       that is stored in the answer node.
       */

      return this.initialType === states.ACTIVITY
        ? this.node.typeData.activity.questions
        : [this.getQuestion(this.node.typeData.questionId)]
    },
    activeQuestion() {
      return this.questions[this.activeQuestionIndex]
    },
    activeQuestionId() {
      return this.activeQuestion.id
    },
    currentQuestionText() {
      return `${this.activeQuestionIndex + 1}/${this.questions.length}`
    },
    hasNext() {
      return this.activeQuestionIndex !== this.questions.length - 1
    },
    hasPrev() {
      return this.activeQuestionIndex !== 0
    },
    nextUnansweredQuestionIndex() {
      let index = this.activeQuestionIndex
      while (index !== this.questions.length - 1) {
        if (!this.questions[++index].completed) return index
      }
      return -1
    },
    hasAnswers() {
      return !!Object.entries(
        this.getAnswers(this.questionNode.id, this.activeQuestion.id)
      ).length
    },
    canChangeAnswer() {
      if (this.initialType === states.ANSWER) {
        return this.node.typeData.isEditable
      }
      return true
    },
    currentQuestionTypeData() {
      return this.initialType === states.ACTIVITY
        ? {
            activityId: this.node.id,
            questionId: this.activeQuestion.id,
          }
        : {}
    },
  },
  watch: {
    activeQuestionId() {
      if (this.initialType === states.ACTIVITY) {
        if (this.hasAnswers && this.state === states.ACTIVITY) {
          this.state = states.ANSWER
        } else if (!this.hasAnswers && this.node.typeData.isEditable) {
          this.state = states.ACTIVITY
        }
      }
      this.scrollToTop()
    },
    state(state) {
      this.scrollToTop(state === states.COMPLETION_SCREEN ? "instant" : "smooth")
    },
  },
  mounted() {
    switch (this.initialType) {
      case states.ACTIVITY:
        if (this.hasAnswers) {
          this.state = states.ANSWER
        } else {
          this.state = states.ACTIVITY
        }
        break
      case states.ANSWER:
        this.state = states.ANSWER
        break
    }

    this.$emit("change:dimensions", {
      width: this.dimensions.width,
      height:
        this.$refs.activity.clientHeight - (this.context === "lightbox" ? 0 : 100),
    })
    this.$emit("load")
  },
  created() {
    this.markQuestionsComplete()
  },
  methods: {
    ...mapActions(["updateNodeProgress"]),
    scrollToTop(behavior = "smooth") {
      if (!this.node.id) return
      this.$nextTick(() => {
        const container = document.querySelector(
          `#multicontent-container .media-container`
        )
        const element = document.getElementById(`row-${this.node.id}`)
        if (container && element) {
          const y = Helpers.getPositionOfElementInElement(element, container).y
          container.scrollTo({ top: y, behavior })
          client.recordAnalyticsEvent(
            "app",
            "scroll",
            "multi-content",
            this.node.id,
            {
              to: y,
            }
          )
        }
      })
    },
    markQuestionsComplete() {
      let numCompleted = 0
      this.questions.forEach(question => {
        const answer = this.getAnswers(this.questionNode.id, question.id)
        if (Object.entries(answer).length === 0 && !question.optional) {
          question.completed = false
        } else {
          question.completed = true
          numCompleted++
        }
      })
      if (numCompleted === this.questions.length && !this.node.completed) {
        this.$emit("complete")
      }
    },
    handleComplete(initiatingComponent) {
      client.recordAnalyticsEvent("user", "submit", "activity", this.node.id, {
        question: this.activeQuestionIndex,
      })

      const numberCompleted = this.questionNode.typeData.activity.questions.filter(
        question => question.completed || question.optional
      ).length
      const progress =
        numberCompleted / this.questionNode.typeData.activity.questions.length
      this.updateNodeProgress({ id: this.questionNode.id, progress }).then(() => {
        if (progress === 1) {
          this.$emit("complete")
        }
      })

      if (initiatingComponent === "activity") {
        if (
          !this.activeQuestion.confirmation.title &&
          !this.activeQuestion.confirmation.message &&
          this.hasNext
        ) {
          if (this.questions[this.activeQuestionIndex + 1].completed) {
            this.state = states.ANSWER
          } else {
            this.next()
          }
        } else {
          this.state = states.COMPLETION_SCREEN
        }
      }
    },
    next() {
      this.state = states.ACTIVITY
      client.recordAnalyticsEvent("user", "next", "activity", this.node.id, {
        from: this.activeQuestionIndex,
        to: this.activeQuestionIndex + 1,
      })
      this.activeQuestionIndex++
    },
    prev() {
      this.state = states.ACTIVITY
      client.recordAnalyticsEvent("user", "prev", "activity", this.node.id, {
        from: this.activeQuestionIndex,
        to: this.activeQuestionIndex - 1,
      })
      this.activeQuestionIndex--
    },
    skip() {
      client.recordAnalyticsEvent("user", "skip", "activity", this.node.id, {
        from: this.activeQuestionIndex,
      })
      this.hasNext ? this.next() : (this.state = states.COMPLETION_SCREEN)
    },
    close() {
      if (this.nextUnansweredQuestionIndex !== -1) {
        this.activeQuestionIndex = this.nextUnansweredQuestionIndex
        this.state = states.ACTIVITY
      } else {
        client.recordAnalyticsEvent("user", "close", "activity", this.node.id)
        if (
          this.node.popup ||
          (this.initialType === "activity" && this.context === "lightbox")
        ) {
          this.$emit("close")
        } else {
          this.activeQuestionIndex = 0
          this.state = states.ANSWER
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.activity-media {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
  z-index: 10;

  &:not(.context-multi-content) {
    padding: 24px;
  }

  .media-title {
    text-align: left;
    font-size: 1.75rem;
    font-weight: 500;
    margin-bottom: 1em;
    width: 100%;
  }
}

.question-footer {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.button-completion {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: var(--highlight-color);
  }

  p {
    margin: 1em auto 0;
    padding: 0;
    font-weight: 600;
  }

  i {
    align-self: center;
  }
}

.button-nav {
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background: var(--text-color-primary);
  color: var(--bg-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0;
  margin-right: 12px;
  opacity: 1;
  transition: all 0.1s ease-out;

  &:hover {
    background: var(--highlight-color);
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:last-child {
    margin-right: 0;
  }
}

.question-step {
  margin: 0;
  padding: 0;
  font-weight: bold;
  font-size: 40px;
  opacity: 0.5;
  margin-right: 32px;
}
</style>
