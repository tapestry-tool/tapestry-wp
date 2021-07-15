<template>
  <b-modal
    id="links-modal"
    data-qa="links-modal"
    visible
    size="lg"
    title="Edit Link"
    body-class="p-0"
    @hidden="close"
  >
    <b-container class="mb-2">
      <b-row style="text-align:center">
        <b-col class="node">{{ source.title }}</b-col>
        <b-col>
          <b-row style="font-size: 5rem;" class="justify-content-center">
            {{ reverse ? "&#8592;" : "&#8594;" }}
          </b-row>
          <b-row class="justify-content-center">
            <b-button size="sm" @click="reverse = !reverse">Reverse</b-button>
          </b-row>
        </b-col>
        <b-col class="node">
          {{ target.title }}
        </b-col>
      </b-row>
    </b-container>
    <template slot="modal-footer">
      <b-button
        size="sm"
        variant="danger"
        :disabled="!canDeleteLink"
        style="margin-right:auto"
        @click="$emit('delet-link')"
      >
        Delete Link
      </b-button>
      <b-button size="sm" variant="secondary" @click="close">
        Cancle
      </b-button>
      <b-button size="sm" variant="primary" @click="save">
        Save
      </b-button>
      <b-form-invalid-feedback :state="canDeleteLink">
        Link can only be deleted if both connected nodes have another link.
      </b-form-invalid-feedback>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import { names } from "@/config/routes"

export default {
  name: "links-modal",
  props: {
    canDeleteLink: {
      type: Boolean,
      required: true,
    },
    source: {
      type: Object,
      required: true,
    },
    target: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      reverse: false,
    }
  },
  created() {
    if (!this.source) this.close()
  },
  methods: {
    ...mapActions(["deleteLink", "reverseLink"]),
    ...mapGetters(["isMultiContent"]),
    close() {
      this.$router.push({
        name: names.APP,
        query: this.$route.query,
      })
    },
    async save() {
      if (this.reverse) {
        this.reverseLink({ source: this.source.id, target: this.target.id })
      }
      this.close()
    },
    async remove() {
      const userConfirmDelete = confirm(
        `Are you sure you want to delete the link between ${this.source.title} and ${this.target.title}?`
      )
      if (userConfirmDelete) {
        await this.deleteLink({ source: this.source.id, target: this.target.id })
        if (this.isMultiContent(this.source.id)) {
          this.source.childOrdering = this.source.childOrdering.filter(
            id => id !== this.target.id
          )
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.node {
  font-size: 1.25rem;
  margin: auto 0;
}
</style>
