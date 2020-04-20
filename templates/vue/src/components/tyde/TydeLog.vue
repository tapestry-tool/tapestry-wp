<template>
  <li class="log">
    <div class="log-thumbnail">
      <div :class="log.type">
        <img v-if="log.imageURL" :src="log.imageURL" class="log-thumbnail-image" />
        <div v-else class="default"></div>
        <tyde-icon
          v-if="log.type === 'activity'"
          :icon="icon"
          class="log-thumbnail-icon"
        ></tyde-icon>
      </div>
    </div>
    <div class="log-details">
      <h1>{{ log.title }}</h1>
      <div v-if="log.type === 'content'">
        <p v-html="formatParagraph(log.description)" />
      </div>
      <button
        v-if="log.type === 'content'"
        class="rewatch-button"
        @click="rewatchNode(log.nodeId)"
      >
        <i class="fas fa-redo fa-2x"></i>
      </button>
      <tyde-activity v-else-if="log.type === 'activity'" :log="log" />
    </div>
    <div class="log-controls">
      <i :class="favoriteClass" @click="favorite = !favorite"></i>
      <i class="fas fa-angle-double-right fa-2x"></i>
    </div>
  </li>
</template>

<script>
import TydeActivity from "./TydeActivity"
import TydeIcon from "./TydeIcon"

export default {
  name: "tyde-log",
  components: {
    TydeActivity,
    TydeIcon,
  },
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
  computed: {
    favoriteClass() {
      return this.favorite ? "fas fa-heart fa-2x" : "far fa-heart fa-2x"
    },
    icon() {
      return this.log.checklist ? "checklist" : this.log.text ? "text" : "audio"
    },
  },
  methods: {
    formatParagraph(str) {
      return str.replace(/(?:\r\n|\r|\n)/g, "<br>")
    },
    rewatchNode(id) {
      this.$emit("close")
      this.$router.push(`/nodes/${id}`)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

.log {
  position: relative;
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
      position: relative;
    }
    .default {
      height: 100%;
      background-color: gray;
    }

    &-image {
      filter: brightness(0.7) saturate(1.5);
    }

    &-icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    img.log-thumbnail-icon {
      height: 100px;
      width: auto;
    }

    i.log-thumbnail-icon {
      font-size: 100px;
      text-shadow: 2px 2px 100px #000;
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

  .rewatch-button {
    background: none;
    position: absolute;
    right: 8px;
    top: 8px;
    border-radius: 50%;
    color: white;
  }
}
</style>
