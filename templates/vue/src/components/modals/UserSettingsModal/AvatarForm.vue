<template>
  <div>
    <b-overlay variant="white">
      <h6 class="mb-3">Customize your avatar</h6>
      <b-row>
        <b-col cols="8" class="customizer pt-1">
          <b-tabs pills vertical>
            <b-tab title="Face" active>
              <b-card-text>
                <b-form-group label="Skin Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.skinColor"
                    :options="options.skinColorOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Eyebrow Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.eyebrowType"
                    :options="options.eyebrowTypeOptions"
                    data-qa="avatar-eyebrow-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Eye Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.eyeType"
                    :options="options.eyeTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Mouth Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.mouthType"
                    :options="options.mouthTypeOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Hair">
              <b-card-text>
                <b-form-group label="Hair Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.topType"
                    :options="options.topTypeOptions"
                    data-qa="avatar-hair-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Hair Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.hairColor"
                    :options="options.hairColorOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Hat Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.topColor"
                    :options="options.topColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Facial Hair">
              <b-card-text>
                <b-form-group label="Facial Hair Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.facialHairType"
                    :options="options.facialHairTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  label="Facial Hair Colour"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="userAvatar.facialHairColor"
                    :options="options.facialHairColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Clothing">
              <b-card-text>
                <b-form-group label="Glasses" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.accessoriesType"
                    :options="options.accessoriesTypeOptions"
                    data-qa="avatar-glasses-select"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Clothing Type" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.clotheType"
                    :options="options.clotheTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group
                  v-if="userAvatar.clotheType == 'GraphicShirt'"
                  label="T-Shirt Graphics"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="userAvatar.graphicType"
                    :options="options.graphicTypeOptions"
                  ></b-form-select>
                </b-form-group>
                <b-form-group label="Clothing Colour" label-for="input-horizontal">
                  <b-form-select
                    v-model="userAvatar.clotheColor"
                    :options="options.clotheColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
            <b-tab title="Background">
              <b-card-text>
                <b-form-group
                  v-if="userAvatar.isCircle"
                  label="Background Colour"
                  label-for="input-horizontal"
                >
                  <b-form-select
                    v-model="userAvatar.circleColor"
                    :options="options.circleColorOptions"
                  ></b-form-select>
                </b-form-group>
              </b-card-text>
            </b-tab>
          </b-tabs>
        </b-col>
        <b-col cols="4" class="title-and-avatar mt-n4">
          <div class="avatar mt-n4">
            <avataaars
              v-if="hasAvatar"
              :isCircle="userAvatar.isCircle"
              :circleColor="userAvatar.circleColor"
              :accessoriesType="userAvatar.accessoriesType"
              :clotheType="userAvatar.clotheType"
              :clotheColor="userAvatar.clotheColor"
              :eyebrowType="userAvatar.eyebrowType"
              :eyeType="userAvatar.eyeType"
              :facialHairColor="userAvatar.facialHairColor"
              :facialHairType="userAvatar.facialHairType"
              :graphicType="userAvatar.graphicType"
              :hairColor="userAvatar.hairColor"
              :mouthType="userAvatar.mouthType"
              :skinColor="userAvatar.skinColor"
              :topType="userAvatar.topType"
              :topColor="userAvatar.topColor"
            ></avataaars>
          </div>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import Avataaars from "vuejs-avataaars"
import avatarOptions from "./avatarOptions"
import { mapActions } from "vuex"

export default {
  name: "avatar-form",
  components: {
    Avataaars,
  },
  props: {
    preferences: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      userAvatar: {},
      options: { ...avatarOptions },
    }
  },
  computed: {
    hasAvatar() {
      return !(!this.userAvatar || Object.keys(this.userAvatar).length === 0)
    },
  },
  created() {
    if (!this.preferences || Object.keys(this.preferences).length === 0) {
      this.userAvatar = avatarOptions.defaultAvatar
    } else {
      this.userAvatar = { ...this.preferences }
    }
  },
  methods: {
    ...mapActions(["updateUserSettings"]),
    saveAvatar() {
      this.updateUserSettings({ avatar: this.userAvatar })
    },
  },
}
</script>

<style scoped>
.title {
  text-align: center;
}

.nav-pills .nav-link.active {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.tabs ul {
  border-left: solid 1px #ddd;
}

.avatar {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 300px;
  margin: 0 auto;
}
</style>
