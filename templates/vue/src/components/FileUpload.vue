<template>
  <b-container fluid>
    <b-row>
        <b-col>
          <b-form-file
            ref= "file-input"
            class= "mb-2"
            placeholder= "Choose a file or drop it here..."
            drop-placeholder= "Drop file here..."
            v-model= "file"
          >
          </b-form-file>
        </b-col>
        <b-col cols="1">
          <h4>OR</h4>
        </b-col>
        <b-col>
          <b-form-input
            :id= inputId
            :placeholder= placeholderText
            :value= "file !== '' ? file.name : null"
            required
          />
        </b-col>
    </b-row>
  </b-container>
  <!-- <div>
    <b-form-file
      ref="file-input"
      class="mb-2"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here...">
    </b-form-file>
    <b-form-input
      id="node-embed-media-duration"
      v-model="node.typeData.mediaURL"
      placeholder="Enter embed link (starting with http)"
      required
    />
    <b-form-input
      id="node-image-url"
      v-model="node.imageURL"
      placeholder="Enter the URL for the thumbnail"
      required
    />
  </div> -->
</template>

<script>

export default {
  name: "file-upload",
  props: {
    inputId: {
      type: String,
      required: true,
    },
    placeholderText: {
      type: String,
      required: true,
    }
  },

  data() {
    return {
      file: "",
      link: ""
    }
  },
  // props: {
  //   field: {
  //     type: String,
  //     required: true,
  //   },
  // },
}
</script>

<style>

</style>
