<template>
  <div class="completion-screen">
    <header>
      <h1>
        {{ question.confirmation.title ? question.confirmation.title : randomTitle }}
      </h1>
      <p v-if="content" v-html="content" />
      <p v-else>
        You can press the button below to continue.
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
  computed: {
    content() {
      const htmlContent = document.createElement("div")
      htmlContent.innerHTML += this.question.confirmation.message

      htmlContent.querySelectorAll("a").forEach(link => {
        link.target = "_blank"
      })
      return String(htmlContent.innerHTML)
    },
    randomTitle() {
      const titles = [
        "Thanks!",
        "Great Job!",
        "Fantastic!",
        "Awesome Job!",
        "Got It!",
      ]
      return titles[Math.floor(Math.random() * titles.length)]
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
