<template>
  <button class="user-answers-button" @click="open">
    <span :class="`${iconClass}`"></span>
    <user-answers-modal
      :show="userAnswersFormOpen"
      :tab="tab"
      @close="close"
      @change:tab="changeTab"
    ></user-answers-modal>
  </button>
</template>

<script>
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"
import UserAnswersModal from "../modals/UserAnswersModal"
export default {
  components: {
    UserAnswersModal,
  },
  props: {
    iconClass: {
      type: String,
      required: false,
      default: "fas fa-address-book",
    },
  },
  computed: {
    userAnswersFormOpen: {
      get() {
        return this.$route.name === names.USERANSWERS
      },
      set(open) {
        this.$router.push({
          name: open ? names.USERANSWERS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "answers" },
          query: this.$route.query,
        })
      },
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    tab: {
      immediate: true,
      handler(requestedTab) {
        if (this.userAnswersFormOpen) {
          const acceptedTabs = ["answers"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.USERANSWERS,
              params: { nodeId: this.$route.params.nodeId, tab: "answers" },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  methods: {
    open() {
      this.userAnswersFormOpen = true
      client.recordAnalyticsEvent("user", "open", "user-answers")
    },
    close() {
      this.userAnswersFormOpen = false
      client.recordAnalyticsEvent("user", "close", "user-answers")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.USERANSWERS,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.user-answers-button,
.user-answers-button:focus {
  padding: 0.5rem;
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}
.user-answers-button:hover {
  background: none;
  color: #11a6d8;
  transform: scale(1.1);
}
</style>
