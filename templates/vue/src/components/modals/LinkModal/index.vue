<template>
  <b-modal
    v-if="target && source"
    id="links-modal"
    visible
    size="lg"
    title="Edit Link"
    body-class="p-0"
    @hidden="close"
  >
    <b-container class="mb-2" data-qa="links-modal">
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
      <b-overlay :show="isLoading" style="width:100%" class="d-flex flex-row">
        <b-button
          size="md"
          variant="danger"
          style="margin-right:auto"
          data-qa="delete-link-btn"
          :disabled="!canDeleteLink"
          @click="remove"
        >
          Delete Link
        </b-button>
        <b-button class="ml-2" size="md" variant="secondary" @click="close">
          Cancel
        </b-button>
        <b-button class="ml-2" size="md" variant="primary" @click="save">
          Save
        </b-button>
      </b-overlay>
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
      required: false,
      default: false,
    },
    source: {
      type: Object,
      required: false,
      default: null,
    },
    target: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      reverse: false,
      isLoading: false,
    }
  },
  mounted() {
    if (!this.source || !this.target) {
      this.close()
    }
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
      this.isLoading = true
      if (this.reverse) {
        await this.reverseLink({ source: this.source.id, target: this.target.id })
      }
      this.isLoading = false
      this.close()
    },
    async remove() {
      if (confirm("Are you sure you want to delete this link?")) {
        this.isLoading = true
        await this.deleteLink({ source: this.source.id, target: this.target.id })
        this.isLoading = false
        if (this.isMultiContent(this.source.id)) {
          this.source.childOrdering = this.source.childOrdering.filter(
            id => id !== this.target.id
          )
        }
      }
      this.close()
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
