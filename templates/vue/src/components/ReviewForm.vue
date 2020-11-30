<template>
  <div class="review-form">
    <input type="text" />
    <div class="review-buttons">
      <b-button size="sm" variant="danger" @click="handleReject">
        Reject
      </b-button>
      <b-button size="sm" variant="success" @click="handleAccept">
        Accept and Add
      </b-button>
    </div>
  </div>
</template>

<script>
import moment from "moment-timezone"
import { getCurrentUser } from "@/services/wp"
//import RichTextForm from "./node-modal/content-form/RichTextForm"

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      comment: "",
    }
  },
  mounted() {
    moment.tz.setDefault("America/Vancouver")
  },
  methods: {
    handleReject() {
      this.node.reviewStatus = "reject"
      this.handleSubmit()
    },
    handleAccept() {
      this.node.status = "publish"
      this.node.reviewStatus = "accept"
      this.handleSubmit()
    },
    handleSubmit() {
      const { name, email } = getCurrentUser()
      if (this.comment.length > 0) {
        this.node.reviewComments.push({
          timestamp: moment().toISOString(),
          comment: this.comment,
          author_name: name,
          author_email: email,
        })
      }
      this.$emit("submit")
    },
    close() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped>
.review-form {
  width: 100%;
}

.review-buttons {
  display: flex;

  button {
    display: block;
    flex: 1;
  }
}
</style>
