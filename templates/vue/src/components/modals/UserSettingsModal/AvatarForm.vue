<template>
  <div>
    <b-overlay variant="white">
      <div class="title-and-avatar">
        <div class="title">
          <h2>Avatar Customizer</h2>
        </div>
        <div class="avatar">
          <avataaars
            :isCircle="isCircle"
            :circleColor="circleColor"
            :accessoriesType="accessoriesType"
            :clotheType="clotheType"
            :clotheColor="clotheColor"
            :eyebrowType="eyebrowType"
            :eyeType="eyeType"
            :facialHairColor="facialHairColor"
            :facialHairType="facialHairType"
            :graphicType="graphicType"
            :hairColor="hairColor"
            :mouthType="mouthType"
            :skinColor="skinColor"
            :topType="topType"
            :topColor="topColor"
          ></avataaars>
        </div>
      </div>
      <div class="customizer">
        <b-card no-body>
          <b-tabs pills card fill>
            <b-tab title="Background" active>
              <b-card-text>
                <b-form-group label="Background Shape" label-for="input-horizontal">
                  <b-form-select
                    v-model="isCircle"
                    :options="isCircleOptions"
                    data-qa="avatar-background-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  v-if="isCircle"
                  label="Circle Colour"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="circleColor"
                    :options="circleColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Face">
              <b-card-text>
                <b-form-group label="Skin Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="skinColor"
                    :options="skinColorOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Eyebrow Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="eyebrowType"
                    :options="eyebrowTypeOptions"
                    data-qa="avatar-eyebrow-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Eye Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="eyeType"
                    :options="eyeTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Mouth Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="mouthType"
                    :options="mouthTypeOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Hair">
              <b-card-text>
                <b-form-group label="Hair Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="topType"
                    :options="topTypeOptions"
                    data-qa="avatar-hair-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Hair Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="hairColor"
                    :options="hairColorOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Hat Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="topColor"
                    :options="topColorOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Facial Hair Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="facialHairType"
                    :options="facialHairTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  label="Facial Hair Colour"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="facialHairColor"
                    :options="facialHairColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Clothing">
              <b-card-text>
                <b-form-group label="Glasses" label-for="input-horizontal">
                  <b-form-select
                    v-model="accessoriesType"
                    :options="accessoriesTypeOptions"
                    data-qa="avatar-glasses-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Clothing Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="clotheType"
                    :options="clotheTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  v-if="clotheType == 'GraphicShirt'"
                  label="T-Shirt Graphics"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="graphicType"
                    :options="graphicTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Clothing Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="clotheColor"
                    :options="clotheColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
          </b-tabs>
        </b-card>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import Avataaars from "vuejs-avataaars"
import avatarOptions from "./avatarOptions"
import { mapActions, mapState } from "vuex"

export default {
  name: "avatar-form",
  components: {
    Avataaars,
  },
  props: {
    avatarPreferences: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      isCircle: true,
      circleColor: "#6fb8e0",
      topType: "NoHair",
      accessoriesType: "Blank",
      facialHairType: "Blank",
      clotheType: "ShirtCrewNeck",
      eyeType: "Default",
      eyebrowType: "Default",
      mouthType: "Default",
      skinColor: "Tanned",
      graphicType: "Bat",
      hairColor: "Black",
      facialHairColor: "Black",
      clotheColor: "Black",
      topColor: "Black",
      isCircleOptions: avatarOptions.isCircleOptions,
      circleColorOptions: avatarOptions.circleColorOptions,
      accessoriesTypeOptions: avatarOptions.accessoriesTypeOptions,
      clotheTypeOptions: avatarOptions.clotheTypeOptions,
      clotheColorOptions: avatarOptions.clotheColorOptions,
      eyebrowTypeOptions: avatarOptions.eyebrowTypeOptions,
      eyeTypeOptions: avatarOptions.eyeTypeOptions,
      facialHairColorOptions: avatarOptions.facialHairColorOptions,
      facialHairTypeOptions: avatarOptions.facialHairTypeOptions,
      graphicTypeOptions: avatarOptions.graphicTypeOptions,
      hairColorOptions: avatarOptions.hairColorOptions,
      mouthTypeOptions: avatarOptions.mouthTypeOptions,
      skinColorOptions: avatarOptions.skinColorOptions,
      topTypeOptions: avatarOptions.topTypeOptions,
      topColorOptions: avatarOptions.topColorOptions,
    }
  },
  computed: {
    ...mapState(["avatar"]),
  },
  mounted() {
    this.setExistingAvatar()
  },
  methods: {
    ...mapActions(["updateAvatar"]),
    setExistingAvatar() {
      if (!this.avatar || Object.keys(this.avatar).length === 0) return
      this.isCircle = this.avatar.isCircle
      this.circleColor = this.avatar.circleColor
      this.accessoriesType = this.avatar.accessoriesType
      this.clotheType = this.avatar.clotheType
      this.clotheColor = this.avatar.clotheColor
      this.eyebrowType = this.avatar.eyebrowType
      this.eyeType = this.avatar.eyeType
      this.facialHairColor = this.avatar.facialHairColor
      this.facialHairType = this.avatar.facialHairType
      this.graphicType = this.avatar.graphicType
      this.hairColor = this.avatar.hairColor
      this.mouthType = this.avatar.mouthType
      this.skinColor = this.avatar.skinColor
      this.topType = this.avatar.topType
      this.topColor = this.avatar.topColor
    },
    saveAvatar() {
      const newAvatar = {}
      newAvatar.isCircle = this.isCircle
      newAvatar.circleColor = this.circleColor
      newAvatar.accessoriesType = this.accessoriesType
      newAvatar.clotheType = this.clotheType
      newAvatar.clotheColor = this.clotheColor
      newAvatar.eyebrowType = this.eyebrowType
      newAvatar.eyeType = this.eyeType
      newAvatar.facialHairColor = this.facialHairColor
      newAvatar.facialHairType = this.facialHairType
      newAvatar.graphicType = this.graphicType
      newAvatar.hairColor = this.hairColor
      newAvatar.mouthType = this.mouthType
      newAvatar.skinColor = this.skinColor
      newAvatar.topType = this.topType
      newAvatar.topColor = this.topColor
      this.updateAvatar(newAvatar)
    },
  },
}
</script>

<style scoped>
.title {
  text-align: center;
}

.avatar {
  display: flex;
  justify-content: center;
  max-width: 300px;
  margin: 0 auto;
}

.customizer {
  margin-top: 50px;
}
</style>
