<template>
  <button @click="$emit('click')">
    <div>
      <img :src="topic.imageURL" />
      <i v-if="topic.completed && showComplete" class="fas fa-check fa-3x"></i>
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
    showComplete: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  margin: 0;
  padding: 0;
  background: none;
  font-family: inherit;
  flex-direction: column;

  &:hover p {
    transform: translateY(-8px);
  }

  div {
    position: relative;
    max-width: 198px;
    margin: 0 auto 20px;
    min-height: 170px;

    img {
      width: 90%;
      height: auto;
    }

    i {
      position: absolute;
      right: 0;
      top: 155px;
      background: #fff;
      border-radius: 50%;
      font-size: 1.5em;
      padding: 5px;
      color: var(--tyde-border-green);
    }
  }

  p {
    padding: 0;
    margin-top: 0.5em;
    font-family: inherit;
    color: inherit;
    font-size: 1.6em;
    transition: transform 0.2s ease-out;
    line-height: 1.3em;
    max-width: 200px;
    min-height: 2em;
    text-shadow: 0px 0px 1px #1C0544,
              1px 1px 1px #1C0544,
              1px -1px 1px #1C0544,
              -1px 1px 1px #1C0544,
              -1px -1px 1px #1C0544;
  }
}
</style>
