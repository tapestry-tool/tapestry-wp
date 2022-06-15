<template>
  <b-row class="choice-container">
    <span v-handle class="fas fa-bars fa-s" style="margin-right: 1em;"></span>
    <div class="input-container">
      <b-input-group :class="{ 'use-image': useImage }">
        <b-input-group-prepend is-text>
          <b-form-checkbox :value="item.id" :disabled="isDisabled" />
          <file-upload
            v-if="useImage"
            v-model="item.imageUrl"
            input-test-id="node-choiceRow-thumbnail-url"
            :data-qa="`choice-row-thumbnail-${item.id}`"
            :show-url-upload="false"
            :show-image-preview="true"
            :compact-mode="true"
            file-types="image/*"
            @isUploading="handleUploadChange"
          />
        </b-input-group-prepend>
        <b-form-input
          v-model="item.value"
          placeholder="Enter choice text"
          class="form-input"
          :class="{ 'm-2': useImage }"
          :data-qa="`choice-row-input-${index}`"
          @keyup.enter="$emit('add')"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            :disabled="!isRemovable"
            :variant="isRemovable ? 'danger' : 'secondary'"
            @click="$emit('remove')"
          >
            X
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
  </b-row>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import { HandleDirective, ElementMixin } from "vue-slicksort"
export default {
  components: {
    FileUpload,
  },
  directives: { handle: HandleDirective },
  mixins: [ElementMixin],
  props: {
    value: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    useImage: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    isRemovable: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      item: this.value,
    }
  },
  watch: {
    item(val) {
      this.$emit("input", val)
    },
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>

<style lang="scss">
.input-container {
  width: calc(100% - 30px);
}
.input-group {
  background: #eceef1;

  &.use-image {
    border: solid 1px #ccc;
    border-radius: 5px;
    border-color: #9c7e81;
  }
  .form-input {
    align-self: center;
  }
}
.choice-container {
  display: flex;
  align-items: center;
  z-index: 9999 !important;
}
</style>
