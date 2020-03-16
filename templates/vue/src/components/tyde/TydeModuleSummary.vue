<template>
  <div>
    <b-card no-body>
      <h3 class="title py-3">{{ module.title }}</h3>
      <b-tabs card>
        <b-tab title="Content" no-body>
          <b-list-group flush>
            <b-list-group-item
              v-for="stage in stages"
              :key="stage.node.id"
              class="p-3"
            >
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
                >
                  <p>{{ topic.description }}</p>
                </tyde-topic>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="Activities">
          <tyde-activity-summary
            v-for="activity in activities"
            :key="activity.id"
            :activity="activity"
          />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeActivitySummary from "./TydeActivitySummary"
import TydeTopic from "./TydeTopic"

export default {
  name: "tyde-module-summary",
  components: {
    TydeActivitySummary,
    TydeTopic,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: true,
    },
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
