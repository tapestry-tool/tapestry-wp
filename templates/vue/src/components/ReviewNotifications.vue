<template>
  <div id="review-notifications">
    <button
      ref="toggle"
      aria-label="toggle pending nodes"
      :class="{ active: showMenu }"
      @click="showMenu = !showMenu"
    >
      <span>
        <tapestry-icon icon="comment-dots" />
        <span v-show="!isEmpty" class="count">{{ nodesPendingReview.length }}</span>
      </span>
    </button>
    <div v-show="showMenu" class="menu">
      <ul :class="{ empty: showMenu }">
        <p v-if="isEmpty">
          There are no nodes awaiting review.
        </p>
        <h1 v-else class="menu-title">
          Nodes awaiting review
        </h1>
        <li v-for="node in nodesPendingReview" :key="node.id">
          <router-link class="link" :to="node.link">
            <div>
              <h1>{{ node.title }}</h1>
              <p>Submitted {{ node.submitTime }} by {{ node.author.name }}</p>
            </div>
            <tapestry-icon icon="arrow-right" />
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import moment from "moment"

import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"
import { nodeStatus } from "@/utils/constants"
import * as Comment from "@/utils/comments"

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
        .map(node => {
          const lastSubmit = node.reviewComments
            .reverse()
            .find(evt => evt.type === Comment.types.STATUS_CHANGE)
          return {
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
            submitTime: moment(lastSubmit.timestamp).fromNow(),
          }
        })
    },
    isEmpty() {
      return this.nodesPendingReview.length === 0
    },
  },
  mounted() {
    const handleClick = evt => {
      if (!evt.target.closest("#review-notifications")) {
        this.showMenu = false
      }
    }
    document.addEventListener("click", handleClick)
    this.$once("hook:destroyed", () => {
      document.removeEventListener("click", handleClick)
    })
  },
}
</script>

<style lang="scss" scoped>
div {
  position: relative;
}

.menu {
  --background: #fbfbfb;
  --border-radius: 8px;

  position: absolute;
  z-index: 10;
  border-radius: var(--border-radius);
  box-shadow: 0 0 7px 0 #ddd;
  left: 50%;
  transform: translateX(-50%);
  min-width: 18rem;

  &:before {
    --size: 0.8rem;
    content: "";
    position: absolute;
    left: 50%;
    width: var(--size);
    height: var(--size);
    background: var(--background);
    box-shadow: 0 0 7px 0 #ddd;
    top: calc(var(--size) / 2 * -1);
    transform: translateX(-50%) rotate(45deg);
    z-index: 10;
  }
}

ul {
  --padding: 1rem;

  display: flow-root;
  border-radius: var(--border-radius);
  position: relative;
  list-style: none;
  background: var(--background);
  z-index: 20;
  padding: var(--padding);
  padding-bottom: 0;
  margin: 0;
  max-height: 32rem;
  overflow-y: scroll;

  li:last-child {
    margin-bottom: var(--padding);
  }

  &.empty {
    overflow: hidden;
  }
}

button {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;

  &.active,
  &:hover {
    background: none;
    color: #11a6d8;
    transform: scale(1.1);
  }
}

.count {
  position: absolute;
  top: 2px;
  font-size: 0.5em;
  color: white;
  background: red;
  padding: 0 4px;
  border-radius: 4px;
  transform: translateX(-8px);
}

h1 {
  font-size: 1em;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  text-align: left;
}

.menu-title {
  padding-bottom: 0.4em;
  border-bottom: solid 1px var(--tapestry-light-gray);
  margin-bottom: 0.4em;
}

.link {
  display: flex;
  align-items: center;
  color: var(--dark);
  padding: 0.4em;
  margin: 0 -0.4em;
  border-radius: 4px;
  text-decoration: none;

  i {
    transition: all 0.2s ease-out;
    transform: translateX(0);
  }

  &:hover {
    background: #eee;
    text-decoration: none;

    i {
      transform: translateX(6px);
    }
  }

  div {
    margin-right: auto;
    text-align: left;
  }

  p {
    color: var(--gray);
    font-size: 0.8em;
  }
}
</style>
