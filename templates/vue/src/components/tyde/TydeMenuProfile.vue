<template>
  <section id="tyde-menu-profile">
    <tyde-button class="back-button" icon="arrow-left" @click="$emit('back')" />
    <ul class="profile-activities">
      <tyde-activity-summary
        v-for="activity in getProfileActivities"
        :key="activity.id"
        :activity="activity"
      />
    </ul>
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import TydeButton from "./TydeButton"
import TydeProfileActivity from "./TydeProfileActivity"

export default {
  name: "tyde-menu-profile",
  components: {
    TydeButton,
    TydeProfileActivity,
  },
  computed: {
    ...mapGetters(["getProfileActivities"]),
  },
}
</script>

<style lang="scss" scoped>
#tyde-menu-profile {
  position: relative;

  .back-button {
    position: absolute;
    top: 0;
    left: -3em;
    width: 64px;
    height: 64px;
    font-size: 32px;
  }

  .profile-activities {
    margin-top: 26px;
    height: calc(100vh - 210px);
    overflow-y: scroll;
  }
}
</style>
