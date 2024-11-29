<template>
  <div class="tyde-program-completion-screen">
    <h2>Congratulations!</h2>
    <div v-if="!isNameSet">
      <p>
        You have completed the TYDE program. To receive your certificate of
        completion and a summary of your profile, please enter your name:
      </p>
      <p>
        <b-input
          v-model="name"
          class="name-input"
          placeholder="Enter your name"
        ></b-input>
        <b-btn variant="primary" @click="setName">Submit</b-btn>
      </p>
      <p class="text-muted">
        The information you enter here is only used for the generation of the
        certificate and summary PDF documents, and is not stored locally or on the
        server.
      </p>
    </div>
    <div v-else>
      <p>
        You have completed the TYDE program. You can find your certificate of
        completion and a summary of your profile below. You can download and save
        these documents by clicking the buttons below.
      </p>
      <h2>Certificate</h2>
      <p>
        <b-button variant="primary" @click="downloadCertificate">
          Download Certificate
        </b-button>
      </p>
      <pdf v-if="certificate" :src="certificate.output('datauristring')" :page="1">
        <template slot="loading">
          <loading />
        </template>
      </pdf>
      <h2>Summary</h2>
      <p>
        <b-button variant="primary" @click="downloadSummary">
          Download Summary
        </b-button>
      </p>
      <pdf v-if="summary" :src="summary.output('datauristring')" :page="1">
        <template slot="loading">
          <loading />
        </template>
      </pdf>
    </div>
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
  </div>
</template>

<script>
import { generateCertificate, generateSummary } from "@/utils/pdf"
import pdf from "pdfvuer"
import Avataaars from "vuejs-avataaars"
import avatarOptions from "@/components/modals/UserSettingsModal/avatarOptions"
import { mapGetters, mapState } from "vuex"
import canvg from "canvg"
import Loading from "@/components/common/Loading"

export default {
  components: {
    pdf,
    Avataaars,
    Loading,
  },
  data() {
    return {
      name: "",
      isNameSet: false,
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
  methods: {
    setName() {
      this.isNameSet = true
      this.certificate = generateCertificate(this.name)
      const profileSummary = this.getTYDEProfileSummary
      this.summary = generateSummary(
        this.generateAvatarImage(),
        profileSummary,
        this.name
      )
    },
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
.name-input {
  width: 300px;
  margin: 0 auto 10px auto;
}
</style>
