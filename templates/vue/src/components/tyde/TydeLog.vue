<template>
  <li class="log">
    <div class="log-thumbnail">
    <img v-if="log.imageURL" :src="log.imageURL" />
      <div v-else-if="log.type === 'activity'" class="activity">
      <i :class="`fas fa-${icon} icon-fa`"></i>
     </div>
      <div v-else class="default"></div>
    </div>
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
    },
    icon() {
      return "tasks" || "microphone"
    },
  },
  methods: {
    formatParagraph(str) {
      return str.replace(/(?:\r\n|\r|\n)/g, '<br>')
    },
  }
}
</script>

<style lang="scss" scoped>
.log {
  background: var(--tapestry-med-gray);
  border: 1px solid var(--tapestry-light-gray);
  margin: 0;
  margin-bottom: 8px;
  min-height: 160px;
  padding: 24px;
  width: 100%;
  display: flex;
  
  .log-thumbnail {
    width: 250px;
    height: 225px;
    float: left;
    .activity {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f79621;
      > i {
        font-size: 100px;
      }
    }
    .default {
      height: 100%;
      background-color: gray;
    }
  }

  img {
    max-width: 250px;
  }

  .log-details {
    float: right;
    font-size: 20px;
    width: calc(100% - 280px);
    word-break: break-word;
    > h1::before {
      content: none;
    }

    > p {
      padding: unset;
      line-height: 1.4em;
      margin-bottom: 0;
    }
  }

  .log-controls {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: auto;
    /* Currently do not support favorites, so hiding this */
    display: none;

    i {
      font-size: 1.5em;
    }
  }
}
</style>
