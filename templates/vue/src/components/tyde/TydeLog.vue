<template>
  <li class="log">
    <img :src="log.imageURL" />
    <div class="log-details">
      <div>{{log.title}}</div>
      <div>{{log.description}}</div>
    </div>
    <div class="log-controls">
      <div>
        <i :class="favoriteClass" @click="favorite = !favorite"></i>
      </div>
      <div>
        <i class="fas fa-angle-double-right fa-2x"></i>
      </div>
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
  }
}
</script>

<style scoped>
img {
  max-width: 350px;
}

.log-details {
  display: flex;
  font-size: 20px;
  margin: 0 50px;
  flex-direction: column;
  word-break: break-word;
}

.log-details > div:first-child {
  font-size: 30px;
  font-weight: bold;
}

.log-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
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
