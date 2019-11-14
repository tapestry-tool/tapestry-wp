<template>
  <div>
    <h1>{{ question.text }}</h1>
    <p>I would like to answer with:</p>
    <div>
      <button>Text</button>
      <button>Audio</button>
      <button>Checklist</button>
    </div>
    <footer>
      <button @click="$emit('next')">Next</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'question',
  props: {
    question: {
      type: Object,
      required: true
    }
  }
}
</script>
