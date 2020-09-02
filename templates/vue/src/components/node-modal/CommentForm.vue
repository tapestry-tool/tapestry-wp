<template>
  <div class="comment-form">
    <b-form-group label="Comment Thread">
      <rich-text-form
        id="node-description"
        ref="richTextForm"
        v-model="comment"
        placeholder="Enter a comment"
      />
    </b-form-group>
    <div>
      <b-button size="sm" variant="primary" @click="handleSubmit">
        Submit comment
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
  },
  methods: {
    handleSubmit() {
      const { data } = wpData.currentUser
      this.node.comments.push({
        timestamp: moment().toISOString(),
        comment: this.comment,
        author_name: data.user_nicename,
        author_email: data.user_email,
      })
      this.$emit("submit")
      this.$refs.richTextForm.clear()
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
