<template>
  <div>
    <b-dropdown id="dropdown-1" :text="text" class="m-md-2">
      <b-dropdown-item>First Action</b-dropdown-item>
      <b-dropdown-item>Second Action</b-dropdown-item>
      <b-dropdown-item>Third Action</b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item active>Active action</b-dropdown-item>
      <b-dropdown-item disabled>Disabled action</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  name: "tapestry-notifications",
  data() {
    return {
      pending: 0,
    }
  },
  computed: {
    text() {
      return "Notifications " + this.pending
    },
  },
}
</script>
