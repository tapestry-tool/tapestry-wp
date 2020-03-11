<template>
  <div>
    <b-card no-body>
      <h3 class="title py-3">{{ module.title }}</h3>
      <b-tabs card>
        <b-tab title="Content" no-body>
          <b-list-group flush>
            <b-list-group-item v-for="stage in stages" :key="stage.node.id">
              <h4 class="mx-0">{{ stage.node.title }}</h4>
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
                <b-button
                  v-for="topic in stage.topics"
                  :key="topic.id"
                  class="p-0"
                  @click="openTopic(topic.id)"
                >
                  <h4>{{ topic.title }}</h4>
                  <p>{{ topic.description }}</p>
                </b-button>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="Activities"></b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "tyde-module-summary",
  props: {
    moduleId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getContent", "getActivities"]),
    module() {
      return this.getNode(this.moduleId)
    },
    stages() {
      return this.getContent(this.moduleId)
    },
    activities() {
      return this.getActivities(this.moduleId)
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
