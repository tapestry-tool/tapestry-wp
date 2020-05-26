<template>
  <div id="modal-content-details">
    <b-form-group label="Title">
      <b-form-input
        id="node-title"
        v-model="node.title"
        data-testid="node-title"
        placeholder="Enter title"
        autofocus
        required
      />
    </b-form-group>
    <b-form-group label="Description">
      <b-form-textarea
        id="node-description"
        v-model="node.description"
        data-testid="node-description"
        placeholder="Enter description"
      ></b-form-textarea>
    </b-form-group>
    <b-form-group v-if="hasSubAccordion" label="Subaccordion Text">
      <b-form-input v-model="node.typeData.subAccordionText"></b-form-input>
    </b-form-group>
    <b-form-group label="Content Type">
      <b-form-select
        id="node-media-type"
        data-testid="node-mediaType"
        :value="nodeType"
        :options="mediaTypes"
        @change="handleTypeChange"
      ></b-form-select>
    </b-form-group>
    <activity-form v-if="node.mediaType === 'activity'" :node="node" />
    <accordion-form v-if="node.mediaType === 'accordion'" :node="node" />
    <b-form-group v-if="node.mediaType === 'wp-post'" label="Post Name">
      <combobox
        v-model="node.typeData.mediaURL"
        item-text="title"
        item-value="id"
        empty-message="There are no Wordpress posts yet. Please add one in your WP dashboard."
        :options="wpPosts"
      >
        <template v-slot="slotProps">
          <p>
            <code>{{ slotProps.option.id }}</code>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group v-if="node.mediaType === 'text'" label="Text content">
      <b-form-textarea
        id="node-text-content"
        v-model="node.typeData.textContent"
        data-testid="node-textContent"
        placeholder="Enter text here"
      ></b-form-textarea>
    </b-form-group>
    <b-form-group
      v-if="node.mediaType === 'video' && nodeType !== 'h5p'"
      label="Video URL"
    >
      <file-upload
        id="node-video-media-url"
        v-model="node.typeData.mediaURL"
        data-testid="node-videoUrl"
        placeholder="Enter URL for MP4 Video"
        required
      />
    </b-form-group>
    <b-form-group
      v-if="node.mediaType === 'video' && nodeType !== 'h5p'"
      label="Video Duration"
    >
      <b-form-input
        id="node-video-media-duration"
        v-model="node.mediaDuration"
        data-testid="node-videoDuration"
        placeholder="Enter duration (in seconds)"
        required
      />
    </b-form-group>
    <b-form-group v-if="nodeType === 'h5p'" label="H5P Content">
      <combobox
        v-model="selectedH5pContent"
        item-text="title"
        item-value="id"
        empty-message="There's no H5P content yet. Please add one in your WP dashboard."
        :options="h5pContentOptions"
      >
        <template v-slot="slotProps">
          <p>
            <code>{{ slotProps.option.id }}</code>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      v-if="nodeType === 'h5p'"
      label="H5P Video Duration"
      description="This only applies to video H5P content"
    >
      <b-form-input
        id="node-h5p-media-duration"
        v-model="node.mediaDuration"
        data-testid="node-h5pDuration"
        placeholder="Enter duration (in seconds)"
        required
      />
    </b-form-group>
    <b-form-group v-if="node.mediaType === 'gravity-form'" label="Gravity Form">
      <span v-if="!gravityFormExists" class="text-muted">
        Gravity Forms plugin is not installed. Please install Gravity Forms to use
        this content type.
      </span>
      <combobox
        v-else
        v-model="selectedGravityFormContent"
        data-testid="combobox-gravity-form"
        item-text="title"
        item-value="id"
        empty-message="There are no Gravity Forms available. You need to first create a Gravity Form to use here."
        :options="gravityFormOptions"
      >
        <template v-slot="slotProps">
          <p>
            <code>{{ slotProps.option.id }}</code>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group v-if="node.mediaType === 'url-embed'" label="External Link">
      <file-upload
        v-model="node.typeData.mediaURL"
        data-testid="node-linkUrl"
        placeholder="Enter embed link (starting with http)"
      />
    </b-form-group>
    <b-form-group v-if="node.mediaType === 'url-embed'" label="Behaviour">
      <b-form-radio-group id="external-link-behaviour" v-model="node.behaviour">
        <b-form-radio value="embed" data-testid="node-linkBehaviour-embed">
          Embed in Tapestry
        </b-form-radio>
        <b-form-radio value="new-window" data-testid="node-linkBehaviour-new-window">
          Open in a New Window
        </b-form-radio>
      </b-form-radio-group>
    </b-form-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import Combobox from "@/components/Combobox"
import FileUpload from "@/components/FileUpload"

export default {
  components: {
    Combobox,
    FileUpload,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getDirectParents", "getNode"]),
    hasSubAccordion() {
      const parents = this.getDirectParents(this.node.id)
      if (parents && parents[0]) {
        const parent = this.getNode(parents[0])
        const children = this.getDirectChildren(this.node.id)
        return parent.mediaType === "accordion" && children.length > 0
      }
      return false
    },
    mediaTypes() {
      return [
        { value: "", text: "Select content type" },
        { value: "text", text: "Text" },
        { value: "video", text: "Video" },
        { value: "h5p", text: "H5P" },
        { value: "url-embed", text: "External Link" },
        { value: "wp-post", text: "Wordpress Post" },
        { value: "activity", text: "Activity" },
        { value: "accordion", text: "Accordion" },
      ]
    },
    nodeType() {
      if (this.node.mediaFormat === "h5p") {
        return "h5p"
      }
      return this.node.mediaType
    },
  },
  methods: {
    handleTypeChange(evt) {
      this.node.mediaType = evt
      this.node.mediaFormat = ""
      if (evt === "video" || evt === "h5p") {
        this.node.mediaFormat = evt === "video" ? "mp4" : "h5p"
      }
    },
  },
}
</script>
