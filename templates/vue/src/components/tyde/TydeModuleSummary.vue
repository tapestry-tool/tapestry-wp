<template>
  <div class="tyde-summary">
    <tyde-button
      class="close-button"
      icon="arrow-right"
      @click="$emit('close')"
    ></tyde-button>
    <header class="p-3">
      <h1 class="title">{{ module.title }}</h1>
      <ul>
        <tyde-tab :is-active="activeTab === 0" @click="activeTab = 0">
          Content
        </tyde-tab>
        <tyde-tab :is-active="activeTab === 1" @click="activeTab = 1">
          Activities
        </tyde-tab>
      </ul>
    </header>
    <div v-if="activeTab === 0" class="content pt-4">
      <div v-for="stage in stages" :key="stage.node.id" class="p-3">
        <h4 class="mx-0 mb-4 mt-2">{{ stage.node.title }}</h4>
        <p v-if="stage.topics.length === 0">
          You haven't completed a topic yet.
        </p>
        <div
          v-else
          :class="{
            center: stage.topics.length < 4,
            grid: stage.topics.length >= 4,
          }"
        >
          <tyde-topic
            v-for="topic in stage.topics"
            :key="topic.id"
            :topic="topic"
            @click="openTopic(topic.id)"
          />
        </div>
      </div>
    </div>
    <div v-else class="content pt-4">
      <tyde-activity-summary
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeActivitySummary from "./TydeActivitySummary"
import TydeButton from "./TydeButton"
import TydeTab from "./TydeTab"
import TydeTopic from "./TydeTopic"

export default {
  name: "tyde-module-summary",
  components: {
    TydeActivitySummary,
    TydeButton,
    TydeTab,
    TydeTopic,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      activeTab: 0,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getContent", "getActivities"]),
    module() {
      return this.getNode(this.nodeId)
    },
    stages() {
      return this.getContent(this.nodeId)
    },
    activities() {
      return this.getActivities(this.nodeId)
    },
  },
  methods: {
    openTopic(id) {
      this.$router.push(`/nodes/${id}`)
    },
  },
}
</script>

<style lang="scss" scoped>
.tyde-summary {
  background: var(--tapestry-gray);
  color: white;

  * {
    font-family: var(--tyde-font-mono);
  }

  h4 {
    font-size: 2em;
  }

  header {
    ul {
      display: flex;
      justify-content: center;
      margin: 0;
    }
  }

  .close-button {
    position: absolute;
    right: 0;
    background: var(--tapestry-med-gray);
    color: white;
  }
}

.content {
  background: #000;
  border-radius: 16px;
}

.center {
  display: flex;
  justify-content: center;

  > * {
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }
  }

  button {
    width: 20%;
  }
}

.topic {
  background: rgba(0, 0, 0, 0.03);
  border: none;
  border-radius: 16px;
  color: inherit;
  padding: 16px 0;

  * {
    margin: 0;
    padding: 0;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.grid {
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 1fr);
}

.title {
  font-weight: 700;
  margin-bottom: 12px;

  &:after {
    display: none;
  }
}
</style>
