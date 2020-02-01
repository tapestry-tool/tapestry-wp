<template>
  <b-container fluid>
    <b-row>
        <b-col>
            <b-form-file
              ref="file"
              name="async-upload"
              class="image-file mb-2"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
              @change="uploadFile"
              required>
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
              :value="value"
              @input="$emit('input', $event)"
              required
            />
          </b-row>
        </b-col>
    </b-row>
    <b-row>
      <progress max="100" :value.prop="uploadPercentage"></progress>
    </b-row>
  </b-container>
</template>

<script>
import axios from "axios"

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
      uploadPercentage: 0
    }
  },

  methods: {
    uploadFile(event) {
      var formData = new FormData()
      formData.append('action', 'upload-attachment')
      formData.append('async-upload', event.target.files[0])
      formData.append('name', event.target.files[0].name)
      formData.append('_wpnonce', wpData.file_upload_nonce)

      axios
        .post( wpData.upload_url, formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function( progressEvent ) {
              this.uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ))
            }.bind(this)
          }
        )
        .then(response => {
          this.$emit('input', response.data.data.url)
        })
    },
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

  progress[value] {
    /* Reset the default appearance */
    -webkit-appearance: none;
    appearance: none;

    width: 250px;
    height: 20px;
  }

  progress[value]::-webkit-progress-bar {
    background-color: #eee;
    border-radius: 2px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-webkit-progress-value {
    background-image:
	   -webkit-linear-gradient(-45deg,
	                           transparent 33%, rgba(0, 0, 0, .1) 33%,
	                           rgba(0,0, 0, .1) 66%, transparent 66%),
	   -webkit-linear-gradient(top,
	                           rgba(255, 255, 255, .25),
	                           rgba(0, 0, 0, .25)),
	   -webkit-linear-gradient(left, #09c, #31e24d);

    border-radius: 2px;
    background-size: 35px 20px, 100% 100%, 100% 100%;
}
</style>
