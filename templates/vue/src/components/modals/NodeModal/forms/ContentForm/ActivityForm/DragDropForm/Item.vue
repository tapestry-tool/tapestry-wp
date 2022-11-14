<template>
  <div class="item-container" :style="itemStyle">
    <b-form-group v-if="useImages">
      <file-upload
        :value="item.imageUrl"
        input-test-id="node-bucketitem-thumbnail-url"
        :show-url-upload="false"
        :show-image-preview="true"
        :compact-mode="true"
        file-types="image/*"
        @input="
          $emit('update-item', { id: item.id, property: 'imageUrl', value: $event })
        "
        @isUploading="handleUploadChange"
      />
    </b-form-group>
    <b-input-group>
      <b-form-input
        ref="input"
        :value="item.text"
        placeholder="Enter item name"
        class="item-text"
        @update="
          $emit('update-item', { id: item.id, property: 'text', value: $event })
        "
      ></b-form-input>
      <b-input-group-append>
        <b-input-group-text v-if="!useImages">
          <color-picker
            class="m-n1 mr-n3 item-background-color"
            :currentColor="item.color"
            @change="
              $emit('update-item', { id: item.id, property: 'color', value: $event })
            "
          />
        </b-input-group-text>
        <b-button
          v-if="itemRemovalAllowed"
          squared
          variant="danger"
          @click="$emit('remove-item')"
        >
          <i class="fas fa-trash-alt"></i>
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import ColorPicker from "@/components/modals/common/ColorPicker"
export default {
  name: "item",
  components: {
    FileUpload,
    ColorPicker,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    itemRemovalAllowed: {
      type: Boolean,
      required: true,
    },
    useImages: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    itemStyle() {
      return this.item.color ? "background-color: " + this.item.color : ""
    },
  },
  mounted() {
    this.$nextTick(() => {
      let self = this
      self.$refs.input.$el.focus()
    })
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>

<style lang="scss" scoped>
.item-container {
  border: solid 1px #a8a8a8;
  background-color: #e4e4e4;
  margin: 10px 0;
  border-radius: 5px;
  margin-left: 0px;
  padding: 1rem;
}
</style>
