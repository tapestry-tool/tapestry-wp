<template>
  <b-input-group class="caption-container mt-2">
    <b-input-group-prepend :is-text="!isPending">
      <b-button v-if="isPending" variant="primary" @click="$emit('move')">
        +
      </b-button>
      <b-form-checkbox
        v-else
        :checked="isSelected"
        @change="$emit('setDefault', $event ? caption.id : null)"
      ></b-form-checkbox>
    </b-input-group-prepend>
    <b-input-group-prepend v-if="isPending && errorMessage" is-text>
      <i
        :id="`caption-error-message-${caption.id}`"
        class="far fa-question-circle"
      ></i>
      <b-tooltip :target="`caption-error-message-${caption.id}`" triggers="hover">
        {{ errorMessage }}
      </b-tooltip>
    </b-input-group-prepend>
    <b-form-input v-model="caption.label" placeholder="Label" />
    <b-form-select v-model="caption.language" :options="languages"></b-form-select>
    <file-upload
      v-model="caption.fileUrl"
      file-types=".vtt"
      compact-mode
      :is-image="false"
      :file-upload-id="
        `caption-file-upload-${isPending ? 'pending' : ''}-${caption.id}`
      "
    />
    <b-input-group-append>
      <b-button
        :variant="isRemovable ? 'danger' : 'secondary'"
        :disabled="!isRemovable"
        @click="$emit('remove')"
      >
        <i class="fas fa-times"></i>
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"

export default {
  components: {
    FileUpload,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: false,
      default: false,
    },
    isRemovable: {
      type: Boolean,
      required: false,
      default: true,
    },
    languages: {
      type: Array,
      required: true,
    },
    errorMessage: {
      type: String,
      required: false,
      default: "",
    },
    isPending: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    caption: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit("input", val)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.caption-container {
  background-color: white;
}

.caption-x-button {
  position: absolute;
  right: -5px;
  top: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  z-index: 10;
}
</style>
