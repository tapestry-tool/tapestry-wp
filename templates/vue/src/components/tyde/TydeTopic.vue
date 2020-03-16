<template>
  <button @click="$emit('click')">
    <div>
      <img :src="topic.imageURL" />
    </div>
    <p>{{ topic.title }}</p>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "tyde-topic",
  props: {
    topic: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss">
button {
  margin: 0;
  background: none;
  color: var(--tyde-border-green);
  font-family: var(--tyde-font-mono);

  &:hover p {
    transform: translateY(-8px);
  }

  div {
    width: 198px;
    height: 198px;

    img {
      width: 90%;
      height: auto;
    }
  }

  p {
    padding: 0;
    margin-top: 0.5em;
    font-family: inherit;
    color: inherit;
    font-size: 32px;
    transition: transform 0.2s ease-out;
    line-height: 0.9em;
    max-width: 200px;
  }
}
</style>
