<template>
  <div>
    <h3 class="title py-3">{{ module.title }}</h3>
    <ul>
      <tyde-tab :is-active="activeTab === 0" @click="activeTab = 0">
        Content
      </tyde-tab>
      <tyde-tab :is-active="activeTab === 1" @click="activeTab = 1">
        Activities
      </tyde-tab>
    </ul>
    <div v-if="activeTab === 0">
      <div v-for="stage in stages" :key="stage.node.id" class="p-3">
        <h4 class="mx-0 mb-4">{{ stage.node.title }}</h4>
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
    <div v-else>
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
import TydeTab from "./TydeTab"
import TydeTopic from "./TydeTopic"

export default {
  name: "tyde-module-summary",
  components: {
    TydeActivitySummary,
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
  background: rgba(0, 0, 0, 0.03);
  font-weight: 600;
  margin-bottom: 0;
}
</style>
