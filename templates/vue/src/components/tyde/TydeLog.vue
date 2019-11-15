<template>
  <li class="log">
    <img v-if="log.imageURL" :src="log.imageURL" />
    <div v-else class="thumbnail-placeholder"></div>
    <div class="log-details">
      <h1>{{log.title}}</h1>
      <p v-html="formatParagraph(log.description)" />
    </div>
    <div class="log-controls">
      <i :class="favoriteClass" @click="favorite = !favorite"></i>
      <i class="fas fa-angle-double-right fa-2x"></i>
    </div>
  </li>
</template>

<script>
import TydeButton from "./TydeButton"
export default {
  name: "tyde-log",
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      favorite: false,
    }
  },
  components: {
    TydeButton,
  },
  computed: {
    favoriteClass() {
      return this.favorite ? 'fas fa-heart fa-2x' : 'far fa-heart fa-2x'
    }
  },
  methods: {
    formatParagraph(str) {
      return str.replace(/(?:\r\n|\r|\n)/g, '<br>')
    },
  }
}
</script>

<style scoped>
img {
  max-width: 250px;
}

.thumbnail-placeholder {
  min-width: 250px;
  min-height: 250px;
  background-color: gray;
}

.log-details {
  display: flex;
  font-size: 20px;
  margin: 0 35px;
  flex-direction: column;
  word-break: break-word;
}

.log-details > h1::before {
  content: none;
}

.log-details > p {
  padding: unset;
  line-height: 1.4em;
  margin-bottom: 0;
}

.log-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
  /* Currently do not support favorites, so hiding this */
  display: none;
}
.log-controls i {
    font-size: 1.5em;
}

.log {
  background: var(--tapestry-med-gray);
  border: 1px solid var(--tapestry-light-gray);
  margin: 0;
  margin-bottom: 8px;
  min-height: 160px;
  padding: 24px;
  width: 100%;
  display: flex;
}
</style>
