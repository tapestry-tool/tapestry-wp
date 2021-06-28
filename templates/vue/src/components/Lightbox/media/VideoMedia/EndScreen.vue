<template>
  <activity-media
    v-if="showActivityScreen"
    :dimensions="dimensions"
    :node="node"
    @change:dimensions="$emit('change:dimensions', $event)"
    @complete="$emit('close')"
    @close="showActivityScreen = false"
  />
  <div v-else data-qa="end-screen" class="end-screen">
    <button @click="handleClick($event, 'rewatch')">
      <i class="fas fa-redo fa-4x"></i>
      <p>Rewatch</p>
    </button>
    <button v-if="context == 'lightbox'" @click="handleClick($event, 'close')">
      <i class="far fa-times-circle fa-4x"></i>
      <p>Close</p>
    </button>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import ActivityMedia from "../ActivityMedia"

export default {
  name: "end-screen",
  components: {
    ActivityMedia,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showActivityScreen: false,
    }
  },
  methods: {
    handleClick(evt, type) {
      client.recordAnalyticsEvent("user", "click", "end-screen", this.node.id, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.$emit(type)
    },
  },
}
</script>

<style lang="scss" scoped>
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #111;
  color: #eee;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;
  border-radius: 1px;

  button {
    background: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: inherit;
    margin-right: 3em;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      color: #11a6d8;
    }

    p {
      margin: 1em auto 0;
      padding: 0;
      font-weight: 600;
    }
  }
}
</style>
