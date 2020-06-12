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
    <b-form-group v-if="node.hasSubAccordion" label="Subaccordion Text">
      <b-form-input v-model="node.typeData.subAccordionText"></b-form-input>
    </b-form-group>
    <b-form-group label="Content Type">
      <b-form-select
        id="node-media-type"
        data-testid="node-mediaType"
        :value="node.mediaType"
        :options="mediaTypes"
        @change="handleTypeChange"
      ></b-form-select>
    </b-form-group>
    <component
      :is="activeForm"
      v-if="activeForm"
      :node="node"
      @load="$emit('load')"
    ></component>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import GravityFormsApi from "@/services/GravityFormsApi"
import ActivityForm from "./content-form/ActivityForm"
import AccordionForm from "./content-form/AccordionForm"
import GravityFormForm from "./content-form/GravityFormForm"
import H5pForm from "./content-form/H5pForm"
import TextForm from "./content-form/TextForm"
import UrlEmbedForm from "./content-form/UrlEmbedForm"
import VideoForm from "./content-form/VideoForm"
import WpPostForm from "./content-form/WpPostForm"

export default {
  components: {
    ActivityForm,
    AccordionForm,
    GravityFormForm,
    H5pForm,
    TextForm,
    UrlEmbedForm,
    VideoForm,
    WpPostForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mediaTypes: [
        { value: "", text: "Select content type" },
        { value: "text", text: "Text" },
        { value: "video", text: "Video" },
        { value: "h5p", text: "H5P" },
        { value: "url-embed", text: "External Link" },
        { value: "wp-post", text: "Wordpress Post" },
        { value: "activity", text: "Activity" },
        { value: "accordion", text: "Accordion" },
      ],
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getDirectParents", "getNode"]),
    activeForm() {
      return this.node.mediaType ? this.node.mediaType + "-form" : null
    },
  },
  watch: {
    activeForm() {
      this.$emit("unload")
    },
  },
  mounted() {
    GravityFormsApi.exists().then(exists => {
      this.mediaTypes.push({
        value: "gravity-form",
        text: "Gravity Form",
        disabled: !exists,
      })
    })
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
