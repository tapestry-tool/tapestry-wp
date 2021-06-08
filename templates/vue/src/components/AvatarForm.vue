<template>
  <div>
    <b-overlay variant="white">
      <div class="title-and-avatar">
        <h2>Avatar Customizer</h2>
        <avataaars
          class="avatar"
          style="max-width: 300px;"
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
import { mapActions, mapState } from "vuex"

export default {
  name: "avatar-form",
  components: {
    Avataaars,
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
      isCircleOptions: [
        { value: true, text: "circle" },
        { value: false, text: "Transparent" },
      ],
      circleColorOptions: [
        { value: "#6fb8e0", text: "default" },
        { value: "#C0392B", text: "red" },
        { value: "#D35400", text: "orange" },
        { value: "#F1C40F", text: "yellow" },
        { value: "#27AE60", text: "green" },
        { value: "#3498DB", text: "blue" },
        { value: "#8E44AD", text: "purple" },
        { value: "#000000", text: "black" },
        { value: "#FFFFFF", text: "white" },
      ],
      accessoriesTypeOptions: [
        { value: "Blank", text: "None" },
        { value: "Kurt", text: "Kurt Cobain Style" },
        { value: "Prescription01", text: "Glasses 1" },
        { value: "Prescription02", text: "Glasses 2" },
        { value: "Round", text: "Round" },
        { value: "Sunglasses", text: "Sunglasses" },
        { value: "Wayfarers", text: "Wayfarers" },
      ],
      clotheTypeOptions: [
        { value: "BlazerShirt", text: "BlazerShirt" },
        { value: "BlazerSweater", text: "BlazerSweater" },
        { value: "CollarSweater", text: "CollarSweater" },
        { value: "GraphicShirt", text: "GraphicShirt" },
        { value: "Hoodie", text: "Hoodie" },
        { value: "Overall", text: "Overall" },
        { value: "ShirtCrewNeck", text: "ShirtCrewNeck" },
        { value: "ShirtScoopNeck", text: "ShirtScoopNeck" },
        { value: "ShirtVNeck", text: "ShirtVNeck" },
      ],
      clotheColorOptions: [
        { value: "Black", text: "Black" },
        { value: "Blue01", text: "Blue01" },
        { value: "Blue02", text: "Blue02" },
        { value: "Blue03", text: "Blue03" },
        { value: "Gray01", text: "Gray01" },
        { value: "Gray02", text: "Gray02" },
        { value: "Heather", text: "Heather" },
        { value: "PastelBlue", text: "PastelBlue" },
        { value: "PastelGreen", text: "PastelGreen" },
        { value: "PastelOrange", text: "PastelOrange" },
        { value: "PastelRed", text: "PastelRed" },
        { value: "PastelYellow", text: "PastelYellow" },
        { value: "Pink", text: "Pink" },
        { value: "Red", text: "Red" },
        { value: "White", text: "White" },
      ],
      eyebrowTypeOptions: [
        { value: "Angry", text: "Angry" },
        { value: "AngryNatural", text: "AngryNatural" },
        { value: "Default", text: "Default" },
        { value: "DefaultNatural", text: "DefaultNatural" },
        { value: "FlatNatural", text: "FlatNatural" },
        { value: "RaisedExcited", text: "RaisedExcited" },
        { value: "RaisedExcitedNatural", text: "RaisedExcitedNatural" },
        { value: "SadConcerned", text: "SadConcerned" },
        { value: "SadConcernedNatural", text: "SadConcernedNatural" },
        { value: "UnibrowNatural", text: "UnibrowNatural" },
        { value: "UpDown", text: "UpDown" },
        { value: "UpDownNatural", text: "UpDownNatural" },
      ],
      eyeTypeOptions: [
        { value: "Close", text: "Close" },
        { value: "Cry", text: "Cry" },
        { value: "Default", text: "Default" },
        { value: "Dizzy", text: "Dizzy" },
        { value: "EyeRoll", text: "EyeRoll" },
        { value: "Happy", text: "Happy" },
        { value: "Hearts", text: "Hearts" },
        { value: "Side", text: "Side" },
        { value: "Squint", text: "Squint" },
        { value: "Surprised", text: "Surprised" },
        { value: "Wink", text: "Wink" },
        { value: "WinkWacky", text: "WinkWacky" },
      ],
      facialHairColorOptions: [
        { value: "Auburn", text: "Auburn" },
        { value: "Black", text: "Black" },
        { value: "Blonde", text: "Blonde" },
        { value: "BlondeGolden", text: "BlondeGolden" },
        { value: "Brown", text: "Brown" },
        { value: "BrownDark", text: "BrownDark" },
        { value: "PastelPink", text: "PastelPink" },
        { value: "Platinum", text: "Platinum" },
        { value: "Red", text: "Red" },
        { value: "SilverGray", text: "SilverGray" },
      ],
      facialHairTypeOptions: [
        { value: "Blank", text: "Blank" },
        { value: "BeardMedium", text: "BeardMedium" },
        { value: "BeardLight", text: "BeardLight" },
        { value: "BeardMagestic", text: "BeardMagestic" },
        { value: "MoustacheFancy", text: "MoustacheFancy" },
        { value: "MoustacheMagnum", text: "MoustacheMagnum" },
      ],
      graphicTypeOptions: [
        { value: "Bat", text: "Bat" },
        { value: "Cumbia", text: "Cumbia" },
        { value: "Deer", text: "Deer" },
        { value: "Diamond", text: "Diamond" },
        { value: "Hola", text: "Hola" },
        { value: "Pizza", text: "Pizza" },
        { value: "Resist", text: "Resist" },
        { value: "Selena", text: "Selena" },
        { value: "Bear", text: "Bear" },
        { value: "SkullOutline", text: "SkullOutline" },
        { value: "Skull", text: "Skull" },
      ],
      hairColorOptions: [
        { value: "Auburn", text: "Auburn" },
        { value: "Black", text: "Black" },
        { value: "Blonde", text: "Blonde" },
        { value: "BlondeGolden", text: "BlondeGolden" },
        { value: "Brown", text: "Brown" },
        { value: "BrownDark", text: "BrownDark" },
        { value: "PastelPink", text: "PastelPink" },
        { value: "Platinum", text: "Platinum" },
        { value: "Red", text: "Red" },
        { value: "SilverGray", text: "SilverGray" },
      ],
      mouthTypeOptions: [
        { value: "Concerned", text: "Concerned" },
        { value: "Default", text: "Default" },
        { value: "Disbelief", text: "Disbelief" },
        { value: "Eating", text: "Eating" },
        { value: "Grimace", text: "Grimace" },
        { value: "Sad", text: "Sad" },
        { value: "ScreamOpen", text: "ScreamOpen" },
        { value: "Serious", text: "Serious" },
        { value: "Smile", text: "Smile" },
        { value: "Tongue", text: "Tongue" },
        { value: "Twinkle", text: "Twinkle" },
        { value: "Vomit", text: "Vomit" },
      ],
      skinColorOptions: [
        { value: "Tanned", text: "Tanned" },
        { value: "Yellow", text: "Yellow" },
        { value: "Pale", text: "Pale" },
        { value: "Light", text: "Light" },
        { value: "Brown", text: "Brown" },
        { value: "DarkBrown", text: "DarkBrown" },
        { value: "Black", text: "Black" },
      ],
      topTypeOptions: [
        { value: "NoHair", text: "NoHair" },
        { value: "Eyepatch", text: "Eyepatch" },
        { value: "Hat", text: "Hat" },
        { value: "Hijab", text: "Hijab" },
        { value: "Turban", text: "Turban" },
        { value: "WinterHat1", text: "WinterHat1" },
        { value: "WinterHat2", text: "WinterHat2" },
        { value: "WinterHat3", text: "WinterHat3" },
        { value: "WinterHat4", text: "WinterHat4" },
        { value: "LongHairBigHair", text: "LongHairBigHair" },
        { value: "LongHairBob", text: "LongHairBob" },
        { value: "LongHairBun", text: "LongHairBun" },
        { value: "LongHairCurly", text: "LongHairCurly" },
        { value: "LongHairCurvy", text: "LongHairCurvy" },
        { value: "LongHairDreads", text: "LongHairDreads" },
        { value: "LongHairFrida", text: "LongHairFrida" },
        { value: "LongHairFro", text: "LongHairFro" },
        { value: "LongHairFroBand", text: "LongHairFroBand" },
        { value: "LongHairNotTooLong", text: "LongHairNotTooLong" },
        { value: "LongHairShavedSides", text: "LongHairShavedSides" },
        { value: "LongHairMiaWallace", text: "LongHairMiaWallace" },
        { value: "LongHairStraight", text: "LongHairStraight" },
        { value: "LongHairStraight2", text: "LongHairStraight2" },
        { value: "LongHairStraightStrand", text: "LongHairStraightStrand" },
        { value: "ShortHairDreads01", text: "ShortHairDreads01" },
        { value: "ShortHairDreads02", text: "ShortHairDreads02" },
        { value: "ShortHairFrizzle", text: "ShortHairFrizzle" },
        { value: "ShortHairShaggyMullet", text: "ShortHairShaggyMullet" },
        { value: "ShortHairShortCurly", text: "ShortHairShortCurly" },
        { value: "ShortHairShortFlat", text: "ShortHairShortFlat" },
        { value: "ShortHairShortRound", text: "ShortHairShortRound" },
        { value: "ShortHairShortWaved", text: "ShortHairShortWaved" },
        { value: "ShortHairSides", text: "ShortHairSides" },
        { value: "ShortHairTheCaesar", text: "ShortHairTheCaesar" },
        { value: "ShortHairTheCaesarSidePart", text: "ShortHairTheCaesarSidePart" },
      ],
      topColorOptions: [
        { value: "Black", text: "Black" },
        { value: "Blue01", text: "Blue01" },
        { value: "Blue02", text: "Blue02" },
        { value: "Blue03", text: "Blue03" },
        { value: "Gray01", text: "Gray01" },
        { value: "Gray02", text: "Gray02" },
        { value: "Heather", text: "Heather" },
        { value: "PastelBlue", text: "PastelBlue" },
        { value: "PastelGreen", text: "PastelGreen" },
        { value: "PastelOrange", text: "PastelOrange" },
        { value: "PastelRed", text: "PastelRed" },
        { value: "PastelYellow", text: "PastelYellow" },
        { value: "Pink", text: "Pink" },
        { value: "Red", text: "Red" },
        { value: "White", text: "White" },
      ],
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
.title-and-avatar {
  text-align: center;
}

.customizer {
  margin-top: 50px;
}
</style>
