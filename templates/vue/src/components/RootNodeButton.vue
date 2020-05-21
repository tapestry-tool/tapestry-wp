<template>
  <div id="root-node-button">
    <div data-testid="root-node-button" @click="showModal">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
    <p>Or</p>
    <b-button class="import-button" @click="openFileBrowser">
      Import a Tapestry
    </b-button>
    <input
      ref="fileInput"
      type="file"
      style="display: none;"
      @change="handleFileChange"
    />
  </div>
</template>

<script>
import TapestryApi from "@/services/TapestryAPI"

const client = new TapestryApi(wpPostId)

export default {
  name: "root-node-button",
  data() {
    return {}
  },
  methods: {
    showModal() {
      this.$emit("add-root-node")
    },
    openFileBrowser() {
      this.$refs.fileInput.click()
    },
    handleFileChange() {
      const file = this.$refs.fileInput.files[0]
      this.importTapestry(file)
    },
    importTapestry(file) {
      const reader = new FileReader()
      reader.onload = e => {
        client
          .importTapestry(JSON.parse(e.target.result))
          .then(res => console.log(res))
      }
      reader.readAsText(file)
    },
  },
}
</script>

<style lang="scss" scoped>
#root-node-button {
  padding-top: 40px;
  display: flex;
  align-items: center;
  flex-direction: column;

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

  > p {
    display: block;
    margin: 12px;
    margin-left: 0;
    margin-right: 0;
  }
}

.import-button {
  background-color: #2c3e50;
  border: none;

  &:hover {
    background-color: #11a6d8;
  }
}
</style>
