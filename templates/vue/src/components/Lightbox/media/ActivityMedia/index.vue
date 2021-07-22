<template>
  <div ref="activity" class="activity-media">
    <h1 v-if="showTitle" class="media-title">{{ node.title }}</h1>
    <completion-screen
      v-if="state === 'completion-screen'"
      :question="activeQuestion"
    >
      <button
        v-if="hasNext"
        class="button-completion"
        data-qa="completion-next-button"
        @click="next"
      >
        <i class="fas fa-arrow-circle-right fa-4x"></i>
        <p>Next question</p>
      </button>
      <button v-else class="button-completion" @click="close">
        <i class="far fa-times-circle fa-4x"></i>
        <p>Done</p>
      </button>
    </completion-screen>
    <question
      v-else-if="state === 'activity'"
      :question="activeQuestion"
      :node="initialType === 'answer' ? questionNode : node"
      @submit="handleComplete('activity')"
      @back="$emit('close')"
    ></question>
    <answer-media
      v-else-if="state === 'answer'"
      :node="node"
      :type-data="currentQuestionTypeData"
      @complete="handleComplete('answer')"
      @close="$emit('close')"
      @load="$emit('load', $event)"
      @edit-question="state = 'activity'"
    ></answer-media>
    <footer class="question-footer">
      <template v-if="state !== 'completion-screen'">
        <b-button
          v-if="hasAnswers && state === 'activity'"
          variant="secondary"
          style="margin-right:auto;"
          @click="state = 'answer'"
        >
          Show previos answer
        </b-button>
        <template v-if="initialType === 'activity'">
          <p class="question-step">{{ currentQuestionText }}</p>
          <button
            v-if="questions.length > 1"
            class="button-nav"
            :disabled="!hasPrev"
            @click="prev"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <button
            v-if="questions.length > 1"
            class="button-nav"
            :disabled="!hasNext"
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
import { mapActions, mapGetters } from "vuex"
import AnswerMedia from "./AnswerMedia.vue"

const states = {
  ACTIVITY: "activity",
  ANSWER: "answer",
  COMPLETIONSCREEN: "completion-screen",
}

export default {
  name: "activity-media",
  components: {
    CompletionScreen,
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
      return this.context === "page" && this.node.typeData.showTitle !== false
    },
    questions() {
      return this.initialType === states.ACTIVITY
        ? this.node.typeData.activity.questions
        : [this.getQuestion(this.node.typeData.questionId)]
    },
    activeQuestion() {
      return this.questions[this.activeQuestionIndex]
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
    hasAnswers() {
      return !!Object.entries(
        this.getAnswers(this.questionNode.id, this.activeQuestion.id)
      ).length
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
    activeQuestion() {
      if (this.initialType === states.ACTIVITY) {
        if (this.hasAnswers && this.state === states.ACTIVITY) {
          this.state = states.ANSWER
        } else if (!this.hasAnswers) {
          this.state = states.ACTIVITY
        }
      }
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
    markQuestionsComplete() {
      this.questions.forEach(question => {
        const answer = this.getAnswers(this.questionNode.id, question.id)
        if (Object.entries(answer).length === 0) {
          question.completed = false
        } else {
          question.completed = true
        }
      })
    },
    handleComplete(sender) {
      if (sender === states.ACTIVITY) {
        this.state = states.COMPLETIONSCREEN
        const numberCompleted = this.questionNode.typeData.activity.questions.filter(
          question => question.completed
        ).length
        const progress =
          numberCompleted / this.questionNode.typeData.activity.questions.length
        this.updateNodeProgress({ id: this.questionNode.id, progress }).then(() => {
          if (progress === 1) {
            this.$emit("complete")
          }
        })
      } else if (
        this.initialType === states.ANSWER &&
        sender === states.ANSWER &&
        this.hasAnswers
      ) {
        this.$emit("complete")
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
    close() {
      client.recordAnalyticsEvent("user", "close", "activity", this.node.id)
      if (this.initialType === "activity") this.$emit("close")
      else {
        this.state = states.ANSWER
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.activity-media {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
  background: #111;
  color: #eee;
  z-index: 10;
  padding: 24px;

  .media-title {
    text-align: left;
    font-size: 1.75rem;
    font-weight: 500;
    margin-bottom: 0.9em;

    :before {
      display: none;
    }
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
    color: #11a6d8;
  }

  p {
    margin: 1em auto 0;
    padding: 0;
    font-weight: 600;
  }
}

.button-nav {
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin: 0;
  margin-right: 12px;
  opacity: 1;
  transition: all 0.1s ease-out;

  &:hover {
    background: #11a6d8;
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
  color: var(--tyde-blue);
  margin-right: 32px;
}
</style>
