<template>
  <div class="completion-screen">
    <header>
      <h1>
        {{ question.confirmationTitle ? question.confirmationTitle : "Thanks!" }}
      </h1>
      <p>
        {{
          question.confirmationMessage
            ? question.confirmationMessage
            : "Your response has been recorded."
        }}
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
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.completion-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex: auto;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>
