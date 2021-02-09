<template>
  <div style="width: 100%">
    <cos-popup
      :show="isOpen"
      style="position: absolute; left: 0; bottom: 0; width: 100%;"
    >
      <template #toggle>
        <cos-popup-button
          style="right: 2rem"
          @click="isOpen ? (showModal = true) : (isOpen = true)"
        >
          <tapestry-icon :icon="isOpen ? 'chevron-down' : 'plus'" />
        </cos-popup-button>
      </template>
      <template #content>
        <add-community-form
          ref="form"
          @back="isOpen = false"
          @add-community="handleAddCommunity"
        />
      </template>
    </cos-popup>
    <cos-modal v-model="showModal">
      <div class="confirm">
        <h1>Would you like to add this community now or later?</h1>
        <ul class="controls">
          <li><button class="secondary" @click="close">Later</button></li>
          <li>
            <button class="primary" @click="addCommunityViaModal">
              Add it now
            </button>
          </li>
        </ul>
      </div>
    </cos-modal>
  </div>
</template>

<script>
import AddCommunityForm from "./AddCommunityForm"
import CosPopup from "./CosPopup"
import CosModal from "./CosModal"
import CosPopupButton from "./CosPopupButton"
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  components: {
    AddCommunityForm,
    CosModal,
    CosPopup,
    CosPopupButton,
    TapestryIcon,
  },
  data() {
    return {
      isOpen: false,
      showModal: false,
    }
  },
  methods: {
    close() {
      this.showModal = false
      this.isOpen = false
    },
    addCommunityViaModal() {
      this.showModal = false
      this.$refs.form.addCommunity()
    },
    handleAddCommunity(community) {
      this.isOpen = false
      this.$emit("add-community", community)
    },
  },
}
</script>

<style scoped lang="scss">
.confirm {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h1 {
    color: #757575;
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
}

.controls {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  column-gap: 1rem;
  color: #757575;

  > * {
    flex: 1;
  }

  button {
    --border-color: var(--cos-color-secondary);

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    color: inherit;
    border: 3px solid var(--border-color);
    border-radius: 0.5rem;

    &.primary {
      --border-color: transparent;
      background: #757575;
      color: white;
    }
  }
}
</style>
