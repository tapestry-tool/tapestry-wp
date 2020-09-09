<template>
  <div class="comment-form">
    <b-form-group label="Comment Thread">
      <rich-text-form-simple
        id="node-description"
        ref="richTextFormSimple"
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
import RichTextFormSimple from "./content-form/RichTextFormSimple"
import moment from "moment-timezone"

export default {
  components: {
    RichTextFormSimple,
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
      this.$refs.richTextFormSimple.clear()
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
