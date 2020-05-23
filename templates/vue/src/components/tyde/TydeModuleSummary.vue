<template>
  <div class="tyde-summary">
    <tyde-button
      class="close-button"
      icon="arrow-left"
      @click="$emit('close')"
    ></tyde-button>
    <img :src="module.typeData.planetViewEarnedIconUrl" class="spaceship-icon" />
    <header class="p-3">
      <h1 class="title">{{ module.title }}</h1>
      <ul>
        <tyde-tab
          v-for="(tab, index) in tabs"
          :key="tab"
          :is-active="activeTab === index"
          @click="activeTab = index"
        >
          {{ tab }}
        </tyde-tab>
      </ul>
    </header>
    <div v-if="activeTab === 0" class="content pt-4">
      <div v-for="stage in stages" :key="stage.node.id" class="p-3">
        <h4 class="mx-0 mb-4 mt-2">{{ stage.node.title }}</h4>
        <p v-if="stage.topics.length === 0">
          There are no topics to show.
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
    <div v-else-if="activeTab === 1" class="content p-4">
      <div v-if="activities.length > 0">
        <tyde-activity-summary
          v-for="activity in activities"
          :key="activity.id"
          :activity="activity"
          :module="module"
        />
      </div>
      <div v-else class="empty-message">
        There are no completed activities yet.
      </div>
    </div>
    <div v-else-if="activeTab === 2" class="content p-4">
      <div v-if="!favourites.length" class="empty-message">
        You have not added any items to your favourites in this module.
      </div>
      <tyde-favourites v-else :favourites="favourites"></tyde-favourites>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TydeActivitySummary from "./TydeActivitySummary"
import TydeButton from "./TydeButton"
import TydeFavourites from "./TydeFavourites"
import TydeTab from "./TydeTab"
import TydeTopic from "./TydeTopic"

export default {
  name: "tyde-module-summary",
  components: {
    TydeActivitySummary,
    TydeButton,
    TydeFavourites,
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
    ...mapGetters([
      "getNode",
      "getModuleContent",
      "getModuleActivities",
      "getModuleFavourites",
    ]),
    tabs() {
      return ["Content", "Activities", "Favourites"]
    },
    module() {
      return this.getNode(this.nodeId)
    },
    stages() {
      return this.getModuleContent(this.nodeId)
    },
    activities() {
      return this.getModuleActivities(this.nodeId)
    },
    favourites() {
      return this.getModuleFavourites(this.nodeId)
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

  .close-button {
    position: absolute;
    left: 16px;
    background: var(--tapestry-med-gray);
    color: white;
  }

  .spaceship-icon {
    position: absolute;
    right: 16px;
    max-height: 120px;
  }

  header {
    .title {
      font-weight: 700;
      margin-bottom: 12px;
      text-align: center;

      &:after {
        display: none;
      }
    }
    ul {
      display: flex;
      justify-content: center;
      margin: 0;
    }
  }

  .content {
    background: #000;
    border-radius: 16px;

    > div {
      > h4 {
        font-size: 1.5em;
        padding-left: 20px;
      }

      > p {
        padding-left: 20px !important;
      }
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
  }

  .grid {
    display: grid;
    grid-gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

.empty-message {
  text-align: center;
}
</style>
