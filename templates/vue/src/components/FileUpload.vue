<template>
  <b-container fluid>
    <b-row>
        <b-col>
          <b-form-file
            name="async-upload"
            class="image-file mb-2"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
            @change="uploadFile"
            required
          >
          </b-form-file>
        </b-col>
        <b-col sm="1" class="divider">
          <h6>OR</h6>
        </b-col>
        <b-col>
          <b-row>
            <b-form-input
              :id="inputId"
              :placeholder="placeholderText"
              v-model="curUrl"
              value="value"
              required
            />
          </b-row>
        </b-col>
    </b-row>
  </b-container>
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
    },
    value: {
      type: String,
      required: false
    }
  },

  data() {
    return{
      curUrl: "",
    }
  },

  methods: {
    uploadFile(event) {
      var formData = new FormData()
      formData.append('action', 'upload-attachment')
      formData.append('async-upload', event.target.files[0])
      formData.append('name', event.target.files[0].name)
      formData.append('_wpnonce', wpData.file_upload_nonce)

      let that = this

      $.ajax({
        url: wpData.upload_url,
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        type: 'POST'
      }).success(function(resp) {
        that.curUrl = resp.data.url
      });
    },
  },
  watch: {
    curUrl(url) {
      this.$emit('input', url)
      console.log("Emitting Change")
    }
  },
}
</script>
<style lang="scss" scoped>
  .image-file {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    width: 100%;
    position: absolute;
    left: 0;
    padding-left: 30px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .divider {
    text-align: center;
    vertical-align: center;
    padding: 10px;
  }
</style>
