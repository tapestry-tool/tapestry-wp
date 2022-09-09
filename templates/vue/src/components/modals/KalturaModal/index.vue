<template>
  <b-modal
    id="kaltura-modal"
    data-qa="kaltura-modal"
    :visible="show"
    size="lg"
    title="Kaltura Sync"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Upload"
          :active="tab === 'upload'"
          @click="changeTab('upload')"
        >
          <kaltura-upload-tab ref="uploadTab" @upload-start="handleUploadStart" />
        </b-tab>
        <b-tab title="Log" :active="tab === 'log'" @click="changeTab('log')">
          <kaltura-upload-log-tab ref="logTab" @refresh="refresh" />
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { names } from "@/config/routes"
import KalturaUploadTab from "./KalturaUploadTab"
import KalturaUploadLogTab from "./KalturaUploadLogTab"

export default {
  components: {
    KalturaUploadTab,
    KalturaUploadLogTab,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      refreshTimer: 0,
    }
  },
  computed: {
    tab() {
      return this.$route.params.tab
    },
  },
  watch: {
    tab: {
      immediate: true,
      handler(requestedTab) {
        if (this.show) {
          const acceptedTabs = ["upload", "log"]
          if (!acceptedTabs.includes(requestedTab)) {
            this.$router.replace({
              name: names.KALTURAMODAL,
              params: { nodeId: this.$route.params.nodeId, tab: "upload" },
              query: this.$route.query,
            })
          }
        }
      },
    },
    show: {
      immediate: true,
      handler(show) {
        if (show) {
          setTimeout(() => {
            this.refresh()
          }, 0)

          this.refreshTimer = setInterval(this.refresh, 15 * 1000)
        } else {
          this.cancelRefresh()
        }
      },
    },
  },
  beforeDestroy() {
    this.cancelRefresh()
  },
  methods: {
    closeModal() {
      this.$root.$emit("bv::hide::modal", "kaltura-modal")
    },
    changeTab(tab) {
      this.$router.push({
        name: names.KALTURAMODAL,
        params: { nodeId: this.$route.params.nodeId, tab },
        query: this.$route.query,
      })
    },
    cancelRefresh() {
      clearInterval(this.refreshTimer)
      this.refreshTimer = 0
    },
    handleUploadStart() {
      setTimeout(this.refresh, 1000)
    },
    refresh() {
      this.$refs.uploadTab.refresh()
      this.$refs.logTab.refresh()
    },
  },
}
</script>
