<template>
  <section id="tyde-menu-profile" class="pt-3">
    <tyde-activity-summary
      v-for="(activity, idx) in getProfileActivities"
      :key="`activity-${idx}`"
      :activity="activity"
    />
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import TydeActivitySummary from "./TydeActivitySummary"

export default {
  name: "tyde-menu-profile",
  components: {
    TydeActivitySummary,
  },
  computed: {
    ...mapGetters(["getProfileActivities"]),
  },
}
</script>
