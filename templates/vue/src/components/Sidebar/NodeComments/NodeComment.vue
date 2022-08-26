<template>
  <div>
    <h3 class="title">
      {{ comment.author }}
      <span class="timestamp">{{ comment.date }}</span>
    </h3>
    <p class="comment">{{ comment.content }}</p>
  </div>
</template>

<script>
export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  color: var(--light-gray);
  font-family: "Avenir", sans-serif;
  font-size: 1em;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;
}

.timestamp {
  font-size: 0.8rem;
}

.comment {
  color: #333;
  background: var(--light-gray);
  margin: 0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border-top-left-radius: 0;
}
</style>
