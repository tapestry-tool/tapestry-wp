<template>
  <cos-popup :show="isOpen">
    <template #toggle>
      <cos-popup-button style="right: 2rem" @click="isOpen = !isOpen">
        <tapestry-icon :icon="isOpen ? 'chevron-down' : 'plus'" />
      </cos-popup-button>
    </template>
    <template #content>
      <add-community-form
        @back="isOpen = false"
        @add-community="handleAddCommunity"
      />
    </template>
  </cos-popup>
</template>

<script>
import AddCommunityForm from "./AddCommunityForm"
import CosPopup from "./CosPopup"
import CosPopupButton from "./CosPopupButton"
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  components: {
    AddCommunityForm,
    CosPopup,
    CosPopupButton,
    TapestryIcon,
  },
  data() {
    return {
      isOpen: false,
    }
  },
  methods: {
    handleAddCommunity(community) {
      this.isOpen = false
      this.$emit("add-community", community)
    },
  },
}
</script>
