<template>
  <div>
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
    <ul v-show="showMenu">
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
            <p>Submitted {{ node.submitTime }}</p>
          </div>
          <tapestry-icon icon="arrow-right" />
        </router-link>
      </li>
    </ul>
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
          const submitTime = node.reviewComments
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
            submitTime: moment(submitTime.timestamp).fromNow(),
          }
        })
    },
    isEmpty() {
      return this.nodesPendingReview.length === 0
    },
  },
  methods: {
    handleClickLink() {
      console.log("clicked!")
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
  border-radius: 4px;
  list-style: none;
  min-width: 15rem;
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
      transform: translateX(4px);
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
