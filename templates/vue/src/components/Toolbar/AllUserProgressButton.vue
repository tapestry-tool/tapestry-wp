<template>
  <button class="all-user-progress-button" @click="open">
    <span :class="iconClass"></span>
    <all-user-progress-modal
      :show="isModalOpen"
      @close="close"
    ></all-user-progress-modal>
  </button>
</template>

<script>
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"
import AllUserProgressModal from "../modals/AllUserProgressModal"
export default {
  components: {
    AllUserProgressModal,
  },
  props: {
    iconClass: {
      type: String,
      required: false,
      default: "fas fa-address-book",
    },
  },
  computed: {
    isModalOpen: {
      get() {
        return this.$route.name === names.ALLUSERPROGRESS
      },
      set(open) {
        if (open || this.$route.name === names.ALLUSERPROGRESS) {
          this.$router.push({
            name: open ? names.ALLUSERPROGRESS : names.APP,
            params: this.$route.params,
            query: this.$route.query,
          })
        }
      },
    },
  },
  methods: {
    open() {
      this.isModalOpen = true
      client.recordAnalyticsEvent("user", "open", "all-user-progress")
    },
    close() {
      this.isModalOpen = false
      client.recordAnalyticsEvent("user", "close", "all-user-progress")
    },
  },
}
</script>

<style lang="scss" scoped>
.all-user-progress-button,
.all-user-progress-button:focus {
  padding: 0.5rem;
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;
}
.all-user-progress-button:hover {
  background: none;
  color: #11a6d8;
  transform: scale(1.1);
}
</style>
