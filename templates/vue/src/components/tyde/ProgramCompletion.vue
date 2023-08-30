<template>
  <div class="tyde-program-completion-screen">
    <h2>Congratulations!</h2>
    <p>You have completed the TYDE program.</p>
    <h2>Certificate</h2>
    <p>
      <b-button variant="primary" @click="downloadCertificate">
        Download Certificate
      </b-button>
    </p>
    <pdf
      v-if="certificate"
      :src="certificate.output('datauristring')"
      :page="1"
    ></pdf>
  </div>
</template>

<script>
import { generateCertificate } from "@/utils/pdf"
import pdf from "pdfvuer"

export default {
  components: {
    pdf,
  },
  data() {
    return {
      certificate: null,
    }
  },
  created() {
    this.certificate = generateCertificate()
  },
  methods: {
    downloadCertificate() {
      this.certificate.save("certificate.pdf")
    },
  },
}
</script>

<style lang="scss" scoped></style>
