<template>
  <div class="review-form">
    <b-form-group label="Reviewer's Comment">
      <rich-text-form
        v-model="comment"
        data-qa="review-comment"
        placeholder="Enter a comment"
        :disabled="disabled"
      />
    </b-form-group>
    <div>
      <b-button size="sm" variant="light" :disabled="disabled" @click="close">
        Cancel
      </b-button>
      <b-button
        size="sm"
        variant="danger"
        :disabled="disabled"
        @click="handleReject"
      >
        Reject
      </b-button>
      <b-button
        size="sm"
        variant="success"
        :disabled="disabled"
        @click="handleAccept"
      >
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
    disabled: {
      type: Boolean,
      required: false,
      default: false,
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
      this.node.reviewStatus = "rejected"
      this.handleSubmit()
    },
    handleAccept() {
      this.node.status = "published"
      this.node.reviewStatus = "accepted"
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
