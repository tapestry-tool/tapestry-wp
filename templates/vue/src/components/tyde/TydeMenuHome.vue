<template>
  <section>
    <nav>
      <ul class="tabs">
        <tyde-tab
          v-for="tab in tabs"
          :key="tab"
          :is-active="tab === activeTab"
          @click="setActiveTab(tab)"
        >
          See {{ tab }}
        </tyde-tab>
      </ul>
    </nav>
    <ul class="logs">
      <tyde-log v-for="log in visibleLogs" :key="log.name" :log="log">
        <p>{{ log.name }}</p>
        <p>Type: {{ log.type }}</p>
        <p>Favourited: {{ log.isFavourite }}</p>
      </tyde-log>
    </ul>
  </section>
</template>

<script>
import TydeLog from "./TydeLog"
import TydeTab from "./TydeTab"

export default {
  name: "tyde-menu-home",
  components: {
    TydeLog,
    TydeTab,
  },
  props: {
    logs: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      activeTab: "all",
      tabs: ["activities", "content", "favourites", "all"],
    }
  },
  computed: {
    visibleLogs() {
      const filter = this.activeTab
      if (filter === "activities") {
        return this.logs.filter(item => item.type === "activity")
      }
      if (filter === "content") {
        return this.logs.filter(item => item.type === "content")
      }
      if (filter === "favourites") {
        return this.logs.filter(item => item.isFavourite)
      }
      return this.logs
    },
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
  },
}
</script>

<style scoped>
.logs {
  margin-top: 16px;
}

.tabs {
  display: flex;
  font-size: 20px;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0 48px;
}
</style>
