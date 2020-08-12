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
      <b-button size="sm" variant="danger" @click="handleReject">
        Reject Node
      </b-button>
      <b-button size="sm" variant="primary" @click="handleAccept">
        Accept Node
      </b-button>
    </div>
  </div>
</template>

<script>
import RichTextForm from "./content-form/RichTextForm"
import moment from "moment-timezone"

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
    console.log(wpData.currentUser)
  },
  methods: {
    handleReject() {
      const { data } = wpData.currentUser
      this.node.status = "reject"
      this.node.comments.push({
        timestamp: moment().toISOString(),
        comment: this.comment,
        author_name: data.user_nicename,
        author_email: data.user_email,
      })
      this.$emit("submit")
    },
    handleAccept() {
      const { author } = wpData.currentUser
      this.node.status = "publish"
      this.node.comments.push({
        timestamp: moment().toISOString(),
        comment: this.comment,
        author: author,
      })
      this.$emit("submit")
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
