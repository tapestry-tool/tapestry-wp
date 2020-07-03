<template>
  <node-modal
    :node-id="nodeIdNumber"
    :modal-type="modalType"
    @close="close"
  ></node-modal>
</template>

<script>
import { mapGetters } from "vuex"
import NodeModal from "./NodeModal.vue"

export default {
  name: "node-modal-wrap",
  components: {
    NodeModal,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: false,
      default: 0,
    },
    modalType: {
      type: String,
      required: true,
      validator: value => {
        return ["", "root", "add", "edit"].includes(value)
      },
    },
  },
  computed: {
    nodeIdNumber() {
      return this.modalType == "root" ? 0 : Number(this.nodeId)
    },
  },
  methods: {
    ...mapGetters(["tapestry"]),
    handleSubmit() {
      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.setOriginalDataset(this.tapestry)
      thisTapestryTool.initialize(true)
      this.close()
    },
    close() {
      this.$router.push(`/`)
    },
  },
}
</script>
