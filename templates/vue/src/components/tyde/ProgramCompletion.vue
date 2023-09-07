<template>
  <div class="tyde-program-completion-screen">
    <h2>Congratulations!</h2>
    <p>
      You have completed the TYDE program. You can find your certificate and summary
      documents below.
    </p>
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
    <h2>Summary</h2>
    <p>
      <b-button variant="primary" @click="downloadSummary">
        Download Summary
      </b-button>
    </p>
    <avataaars
      ref="avatar"
      class="hidden"
      :isCircle="currentAvatar.isCircle"
      :circleColor="currentAvatar.circleColor"
      :accessoriesType="currentAvatar.accessoriesType"
      :clotheType="currentAvatar.clotheType"
      :clotheColor="currentAvatar.clotheColor"
      :eyebrowType="currentAvatar.eyebrowType"
      :eyeType="currentAvatar.eyeType"
      :facialHairColor="currentAvatar.facialHairColor"
      :facialHairType="currentAvatar.facialHairType"
      :graphicType="currentAvatar.graphicType"
      :hairColor="currentAvatar.hairColor"
      :mouthType="currentAvatar.mouthType"
      :skinColor="currentAvatar.skinColor"
      :topType="currentAvatar.topType"
      :topColor="currentAvatar.topColor"
    ></avataaars>
    <pdf v-if="summary" :src="summary.output('datauristring')" :page="1"></pdf>
  </div>
</template>

<script>
import { generateCertificate, generateSummary } from "@/utils/pdf"
import pdf from "pdfvuer"
import Avataaars from "vuejs-avataaars"
import avatarOptions from "@/components/modals/UserSettingsModal/avatarOptions"
import { mapGetters, mapState } from "vuex"
import canvg from "canvg"

export default {
  components: {
    pdf,
    Avataaars,
  },
  data() {
    return {
      certificate: null,
      summary: null,
    }
  },
  computed: {
    ...mapState(["avatar"]),
    ...mapGetters(["getTYDEProfileSummary"]),
    currentAvatar() {
      if (this.avatar && Object.keys(this.avatar).length) {
        return this.avatar
      }
      return avatarOptions.defaultAvatar
    },
  },
  mounted() {
    this.certificate = generateCertificate()
    const profileSummary = this.getTYDEProfileSummary
    this.summary = generateSummary(this.generateAvatarImage(), profileSummary)
  },
  methods: {
    downloadCertificate() {
      this.certificate.save("certificate.pdf")
    },
    downloadSummary() {
      this.summary.save("summary.pdf")
    },
    generateAvatarImage() {
      const rawAvatar = new XMLSerializer().serializeToString(this.$refs.avatar.$el)

      var options = {
        ignoreMouse: true,
        ignoreAnimation: true,
        ignoreDimensions: true,
        ignoreClear: true,
      }

      var canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 300
      var ctx = canvas.getContext("2d")
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      canvg.fromString(ctx, rawAvatar, options).render(options)

      return canvas.toDataURL("image/jpeg", 1.0)
    },
  },
}
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}
h2 {
  margin: 1rem 0;
}
</style>
