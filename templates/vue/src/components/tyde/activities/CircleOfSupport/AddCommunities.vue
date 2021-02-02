<template>
  <cos-popup>
    <template #toggle="{ isOpen, toggle }">
      <cos-popup-button style="right: 2rem" @click="toggle">
        <tapestry-icon :icon="isOpen ? 'chevron-down' : 'plus'" />
      </cos-popup-button>
    </template>
    <template #content>
      <add-community-form />
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
}
</script>
