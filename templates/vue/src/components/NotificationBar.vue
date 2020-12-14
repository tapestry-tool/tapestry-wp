<template>
  <div>
    <button
      ref="toggle"
      aria-label="toggle pending nodes"
      @click="handleClick"
      @focus="showMenu = true"
      @blur="handleBlur"
    >
      <span>
        <tapestry-icon icon="comment-dots" />
        <span v-show="!isEmpty">{{ nodesPendingReview.length }}</span>
      </span>
    </button>
    <ul v-show="showMenu">
      <p v-if="isEmpty">
        There are no nodes awaiting review.
      </p>
      <li v-for="node in nodesPendingReview" :key="node.id">
        <router-link :to="node.link">
          {{ node.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex"

import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"
import { nodeStatus } from "@/utils/constants"

export default {
  components: {
    TapestryIcon,
  },
  data() {
    return {
      showMenu: false,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    nodesPendingReview() {
      return Object.values(this.nodes)
        .filter(node => node.reviewStatus === nodeStatus.SUBMIT)
        .map(node => ({
          ...node,
          link: {
            name: names.APP,
            params: {
              nodeId: node.id,
            },
            query: {
              ...this.$route.query,
              sidebar: "review",
            },
          },
        }))
    },
    isEmpty() {
      return this.nodesPendingReview.length === 0
    },
  },
  methods: {
    handleClick() {
      this.showMenu ? this.$refs.toggle.blur() : this.$refs.toggle.focus()
    },
    handleBlur() {
      this.$nextTick(() => (this.showMenu = false))
    },
  },
}
</script>

<style lang="scss" scoped>
div {
  position: relative;
}

ul {
  position: absolute;
  z-index: 10;
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem;
  width: 8rem;
}

button {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;

  &:focus,
  &:hover {
    background: none;
    color: #11a6d8;
    transform: scale(1.1);
  }
}
</style>
