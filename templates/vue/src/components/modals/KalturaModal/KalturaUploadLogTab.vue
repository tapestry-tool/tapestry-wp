<template>
  <div>
    <div>Upload Log</div>
    <b-form-text>
      Automatically refreshes every 15 seconds; you can also manually refresh.
      <br />
      Once the upload has completed, please reload the page to see the updated node
      content.
    </b-form-text>
    <div class="my-3 d-flex flex-row align-items-center">
      <b-form-select v-model="perPage" class="per-page-select mr-2">
        <b-form-select-option :value="10">10 per page</b-form-select-option>
        <b-form-select-option :value="25">25 per page</b-form-select-option>
        <b-form-select-option :value="50">50 per page</b-form-select-option>
        <b-form-select-option :value="100">100 per page</b-form-select-option>
        <b-form-select-option :value="0">Show all entries</b-form-select-option>
      </b-form-select>
      <b-pagination
        v-model="currentPage"
        class="mb-0"
        aria-controls="upload-log-table"
        :total-rows="uploadLogLength"
        :per-page="perPage"
      ></b-pagination>
      <b-button size="sm" class="ml-auto" @click="$emit('refresh')">
        Refresh
      </b-button>
    </div>
    <b-table
      id="upload-log-table"
      ref="uploadLogTable"
      class="my-3"
      responsive
      striped
      show-empty
      empty-text="No videos were uploaded from this Tapestry."
      :fields="[
        {
          key: 'uploadTime',
          class: 'align-top',
        },
        {
          key: 'nodeID',
          class: 'align-top',
        },
        {
          key: 'nodeTitle',
          class: 'align-top',
        },
        {
          key: 'uploadStatus',
          class: 'align-top',
        },
        {
          key: 'kalturaID',
          class: 'align-top',
        },
        {
          key: 'additionalInfo',
          class: 'align-top',
        },
      ]"
      :items="getUploadLog"
      :current-page="currentPage"
      :per-page="perPage"
    ></b-table>
  </div>
</template>
<script>
import KalturaAPI from "@/services/KalturaAPI"

export default {
  data() {
    return {
      uploadLogLength: 0,
      currentPage: 1,
      perPage: 10,
    }
  },
  methods: {
    getUploadLog(ctx, callback) {
      KalturaAPI.getUploadLog(ctx.currentPage, ctx.perPage)
        .then(data => {
          callback(data.videos)
          this.uploadLogLength = data.totalCount
        })
        .catch(() => {
          callback([])
        })

      return null
    },
    refresh() {
      this.$refs.uploadLogTable.refresh()
    },
  },
}
</script>

<style lang="scss" scoped>
.per-page-select {
  width: inherit !important;
}
</style>
