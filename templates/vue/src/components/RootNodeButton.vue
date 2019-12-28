<template>
  <div id="root-node-button">
    <div @click="showModal">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "root-node-button",
  data() {
    return {}
  },
  methods: {
    showModal() {
      this.$emit("add-root-node")
    },
  },
}
</script>

<style lang="scss" scoped>
#root-node-button {
  padding-top: 40px;

  > div {
    display: inline-block;
    margin-top: 20vh;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover,
    &:active {
      transform: scale(1.1);
      color: #11a6d8;
    }

    > div {
      text-align: center;
      font-size: 1.5em;
      padding-top: 10px;
    }
  }
}
</style>
