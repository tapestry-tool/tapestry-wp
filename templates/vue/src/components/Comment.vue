<template>
  <b-card>
    <b-card-text>
      <h3>{{ comment.author_name }} says:</h3>
      <div v-html="comment.comment" />
      <div>Time: {{ comment.timestamp }}</div>
    </b-card-text>
  </b-card>
</template>

<script>
export default {
  props: ["comment"],
}
</script>

<style scoped>
* {
  color: black;
}

.card {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

</style>
