<template>
  <div class="review-form">
    <b-form-group label="Reviewer's Comment">
      <rich-text-form
        id="node-description"
        v-model="comment"
        placeholder="Enter a comment"
      />
    </b-form-group>
    <div>
      <b-button size="sm" variant="light" @click="close">
        Cancel
      </b-button>
      <b-button size="sm" variant="danger" @click="handleReject">
        Reject
      </b-button>
      <b-button size="sm" variant="primary" @click="handleAccept">
        Accept and Add
      </b-button>
    </div>
  </div>
</template>

<script>
import moment from "moment-timezone"
import { getCurrentUser } from "@/services/wp"
import RichTextForm from "./content-form/RichTextForm"

export default {
  components: {
    RichTextForm,
  },
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
      this.node.status = "reject"
      this.handleSubmit()
    },
    handleAccept() {
      this.node.status = "accept"
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
  display: flex;
  flex-direction: column;

  > div {
    text-align: right;
  }
}
</style>
