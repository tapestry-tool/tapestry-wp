<template>
  <div id="modal-content-details">
    <b-form-group label="Title">
      <b-form-input
        id="node-title"
        v-model="node.title"
        data-qa="node-title"
        data-testid="node-title"
        placeholder="Enter title"
        autofocus
        required
      />
    </b-form-group>
    <b-form-group v-if="addDesc || node.description.length" label="Description">
      <rich-text-form
        id="node-description"
        v-model="node.description"
        data-qa="node-description"
        placeholder="Enter description"
        :maxLength="maxDescriptionLength"
      />
    </b-form-group>
    <div v-else class="text-right mt-n3 mb-n2">
      <a href="#" class="small" @click="addDesc = true">Add Description</a>
    </div>
    <b-form-group v-if="node.hasSubAccordion" label="Subaccordion Text">
      <b-form-input v-model="node.typeData.subAccordionText"></b-form-input>
    </b-form-group>
    <b-form-group label="Content Type">
      <b-form-select
        id="node-media-type"
        data-qa="node-media-type"
        data-testid="node-media-type"
        :value="node.mediaType"
        :options="mediaTypes"
        @change="handleTypeChange"
      ></b-form-select>
    </b-form-group>
    <b-form-group label="Content Details">
      <b-card
        bg-variant="light"
        class="px-4 py-3 pb-4 mx-n4 mb-n5"
        style="border-radius: 0; border-bottom:0;"
        no-body
      >
        <component
          :is="activeForm"
          v-if="activeForm"
          :node="node"
          :actionType="actionType"
          @load="$emit('load')"
          @unload="$emit('unload')"
        ></component>
      </b-card>
    </b-form-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import GravityFormsApi from "@/services/GravityFormsApi"
import ActivityForm from "./ActivityForm"
import QuestionForm from "./QuestionForm"
import MultiContentForm from "./MultiContentForm"
import GravityFormForm from "./GravityFormForm"
import H5pForm from "./H5pForm"
import TextForm from "./TextForm"
import RichTextForm from "./RichTextForm"
import UrlEmbedForm from "./UrlEmbedForm"
import VideoForm from "./VideoForm"
import WpPostForm from "./WpPostForm"

export default {
  components: {
    ActivityForm,
    QuestionForm,
    MultiContentForm,
    GravityFormForm,
    H5pForm,
    TextForm,
    RichTextForm,
    UrlEmbedForm,
    VideoForm,
    WpPostForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
    maxDescriptionLength: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      addDesc: false,
      mediaTypes: [
        { value: "", text: "Select content type" },
        { value: "text", text: "Text" },
        { value: "video", text: "Video" },
        { value: "h5p", text: "H5P" },
        { value: "url-embed", text: "External Link" },
        { value: "wp-post", text: "Wordpress Post" },
        { value: "question", text: "Question" },
        { value: "activity", text: "Activity" },
        { value: "gravity-form", text: "Gravity Form", disabled: true },
        { value: "multi-content", text: "Multi-Content" }, // must be last item
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
    if (this.node.mediaType !== "activity") {
      this.mediaTypes = this.mediaTypes.filter(type => type.value !== "activity")
    }
    GravityFormsApi.exists().then(exists => {
      const i = this.mediaTypes.findIndex(
        mediaType => mediaType.value == "gravity-form"
      )
      if (exists) {
        this.mediaTypes[i].disabled = false
      } else {
        this.mediaTypes[i].text += " (plugin unavailable)"
      }
    })
  },
  methods: {
    handleTypeChange(evt) {
      this.node.mediaType = evt
      this.node.mediaFormat = ""
      if (evt === "video" || evt === "h5p") {
        this.node.mediaFormat = evt === "video" ? "mp4" : "h5p"
      }
      this.$emit("type-changed", evt)
    },
  },
}
</script>
