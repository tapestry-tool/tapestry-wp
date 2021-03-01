<template>
  <div style="height: 100%; width: 100%;">
    <communities-list :communities="communities" :connections="connections" />
    <connections-tab
      class="tab"
      :connections="connections"
      :communities="communities"
      @add-connection="$emit('add-connection', $event)"
      @add-community="$emit('add-community', $event)"
      @update-connection="$emit('update-connection', $event)"
    />
    <add-community-tab @add-community="$emit('add-community', $event)" />
  </div>
</template>

<script>
import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "./ConnectionsTab"
import CommunitiesList from "./CommunitiesList"

export default {
  components: {
    AddCommunityTab,
    ConnectionsTab,
    CommunitiesList,
  },
  props: {
    connections: {
      type: Object,
      required: true,
    },
    communities: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>
.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
