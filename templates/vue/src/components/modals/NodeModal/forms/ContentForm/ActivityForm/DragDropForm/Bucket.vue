<template>
  <b-card
    :no-body="!items"
    header-tag="header"
    footer-tag="footer"
    body-class="pb-1 pt-2"
    class="mt-3 w-100"
  >
    <template #header>
      <b-form-input
        ref="input"
        :value="bucket.text"
        placeholder="Enter bucket name"
        class="side bucket-label"
        @update="$emit('update-name', $event)"
      ></b-form-input>
    </template>
    <b-form-group v-if="items">
      <item
        v-for="item in items"
        :key="item.id"
        :item="item"
        :useImages="useImages"
        :itemRemovalAllowed="itemRemovalAllowed"
        @update-item="$emit('update-item', $event)"
        @remove-item="$emit('remove-item', item.id)"
      />
      <b-button
        v-if="bucket.type === 'from'"
        variant="primary"
        class="add-item mt-1"
        @click="$emit('add')"
      >
        Add item
      </b-button>
    </b-form-group>
    <template v-if="bucketRemovalAllowed" #footer>
      <b-button
        class="side"
        size="sm"
        variant="danger"
        @click="$emit('remove-bucket', bucket.id)"
      >
        Delete bucket
      </b-button>
    </template>
  </b-card>
</template>

<script>
import Item from "./Item"
export default {
  name: "bucket",
  components: {
    Item,
  },
  props: {
    bucket: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: false,
      default: null,
    },
    useImages: {
      type: Boolean,
      required: false,
      default: false,
    },
    bucketRemovalAllowed: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    itemRemovalAllowed() {
      return this.items.length > 1
    },
  },
  mounted() {
    this.$nextTick(() => {
      let self = this
      self.$refs.input.$el.focus()
    })
  },
}
</script>
