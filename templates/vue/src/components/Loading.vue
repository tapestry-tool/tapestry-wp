<template>
  <div class="loading">
    <label>{{ label }}</label>
    <div>
      <b-spinner
        type="grow"
        variant="secondary"
        small
        style="margin: 5px 5px 5px 20px;"
      ></b-spinner>
      <b-spinner
        type="grow"
        variant="primary"
        small
        style="margin: 5px;"
      ></b-spinner>
      <b-spinner type="grow" variant="danger" small style="margin: 5px;"></b-spinner>
    </div>
  </div>
</template>

<script>
export default {
  name: "loading",
  props: {
    label: {
      type: String,
      required: false,
      default: "Loading...",
    },
  },
}
</script>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: inherit;
}
</style>
