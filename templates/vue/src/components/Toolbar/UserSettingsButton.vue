<template>
  <button class="user-settings-button" @click="open">
    <avataaars
      v-if="showAvatar"
      class="avatar"
      :isCircle="currentAvatar.isCircle"
      :circleColor="currentAvatar.circleColor"
      :accessoriesType="currentAvatar.accessoriesType"
      :clotheType="currentAvatar.clotheType"
      :clotheColor="currentAvatar.clotheColor"
      :eyebrowType="currentAvatar.eyebrowType"
      :eyeType="currentAvatar.eyeType"
      :facialHairColor="currentAvatar.facialHairColor"
      :facialHairType="currentAvatar.facialHairType"
      :graphicType="currentAvatar.graphicType"
      :hairColor="currentAvatar.hairColor"
      :mouthType="currentAvatar.mouthType"
      :skinColor="currentAvatar.skinColor"
      :topType="currentAvatar.topType"
      :topColor="currentAvatar.topColor"
    ></avataaars>
    <span v-else class="fas fa-user fa-s"></span>
    <user-settings-modal
      :show="avatarFormOpen"
      :tab="tab"
      @close="close"
      @change:tab="changeTab"
    ></user-settings-modal>
  </button>
</template>

<script>
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"
import UserSettingsModal from "../modals/UserSettingsModal"
import Avataaars from "vuejs-avataaars"
import avatarOptions from "@/components/modals/UserSettingsModal/avatarOptions"
import { mapState } from "vuex"

export default {
  components: {
    UserSettingsModal,
    Avataaars,
  },
  props: {
    showAvatar: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapState(["avatar"]),
    avatarFormOpen: {
      get() {
        return this.$route.name === names.USERSETTINGS
      },
      set(open) {
        this.$router.push({
          name: open ? names.USERSETTINGS : names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: "avatar" },
          query: this.$route.query,
        })
      },
    },
    currentAvatar() {
      if (this.avatar && Object.keys(this.avatar).length) {
        return this.avatar
      }
      return avatarOptions.defaultAvatar
    },
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    tab: {
      immediate: true,
      handler(requestedTab) {
        if (this.settingsModalOpen) {
          const acceptedTabs = ["avatar", "theme"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.USERSETTINGS,
              params: { nodeId: this.$route.params.nodeId, tab: "avatar" },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  methods: {
    open() {
      this.avatarFormOpen = true
      client.recordAnalyticsEvent("user", "open", "user-settings")
    },
    close() {
      this.avatarFormOpen = false
      this.$root.$emit("avatar-form-closed")
      client.recordAnalyticsEvent("user", "close", "user-settings")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.USERSETTINGS,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.user-settings-button,
.user-settings-button:focus {
  padding: 0.5rem;
  background: none;
  color: #999;
  font-size: 1.2em;
  transition: all 0.2s ease;
  outline: none;

  &:hover {
    background: none;
    color: var(--highlight-color);
    transform: scale(1.1);
  }
}
</style>
