<template>
  <div>
    <b-button v-b-modal.my-modal>Show Avatar Form</b-button>
    <b-modal id="my-modal">
      <b-container>
        <b-overlay variant="black">
          <avataaars
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
            :topType="'NoHair'"
            :topColor="'random'"
          ></avataaars>
          <b-form-group class="selection">
            <b-form-select v-model="selected" :options="options"></b-form-select>
          </b-form-group>
          <b-form-group>
            <b-form-select
              v-model="isCircle"
              :options="isCircleOptions"
            ></b-form-select>
          </b-form-group>
          <div class="mt-3">
            Selected:
            <strong>{{ selected }}</strong>
          </div>
        </b-overlay>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import Avataaars from "vuejs-avataaars"

export default {
  name: "avatar-form",
  components: {
    Avataaars,
  },
  data() {
    return {
      selected: null,
      isCircle: true,
      circleColor: "#6fb8e0",
      topType: "random",
      accessoriesType: "Prescription01",
      facialHairType: "random",
      clotheType: "random",
      eyeType: "random",
      eyebrowType: "random",
      mouthType: "random",
      skinColor: "random",
      graphicType: "random",
      hairColor: "random",
      facialHairColor: "random",
      topColor: "random",
      clotheColor: "random",
      options: [
        { value: null, text: "Please select an option" },
        { value: "a", text: "This is First option" },
        { value: "b", text: "Selected Option" },
        { value: { C: "3PO" }, text: "This is an option with object value" },
        { value: "d", text: "This one is disabled", disabled: true },
      ],
      isCircleOptions: [
        { value: true, text: "circle" },
        { value: false, text: "none" },
      ],
    }
  },
}
</script>

<style scoped>
.selection {
  margin-top: 50px;
}
</style>
