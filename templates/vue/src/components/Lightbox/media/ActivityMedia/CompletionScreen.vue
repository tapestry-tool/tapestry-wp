<template>
  <div class="completion-screen">
    <header>
      <h1>
        {{ question.confirmation.title ? question.confirmation.title : "Thanks!" }}
      </h1>
      <p
        v-if="question.confirmation.message"
        v-html="question.confirmation.message"
      />
      <p v-else>
        Your response has been recorded.
      </p>
    </header>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "completion-screen",
  props: {
    question: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
}
</script>

<style lang="scss" scoped>
.completion-screen {
  background-color: #eeeeee;
  width: 100%;
  height: 100%;
  display: flex;
  flex: auto;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>
