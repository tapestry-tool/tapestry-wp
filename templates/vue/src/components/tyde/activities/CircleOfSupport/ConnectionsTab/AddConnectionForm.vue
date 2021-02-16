<template>
  <div>
    <add-community-form
      v-show="showCommunityForm"
      @back="showCommunityForm = false"
      @add-community="handleAddCommunity"
    />
    <form v-show="!showCommunityForm" style="height: 100%" @submit.stop.prevent>
      <div class="connection" style="flex: 1">
        <input
          v-model="connection.name"
          name="connection name"
          class="connection-name"
          type="text"
          placeholder="connection"
          @blur="isInputTouched = true"
        />
        <b-form-invalid-feedback :state="isNameValid">
          Please enter a name for your connection.
        </b-form-invalid-feedback>
        <div id="emoji-picker" style="position: relative">
          <button class="preview" @click="showPicker = !showPicker">
            {{ connection.avatar }}
          </button>
          <div v-show="showPicker" class="picker" data-qa="emoji-picker">
            <v-emoji-picker @select="handleEmojiSelect" />
          </div>
        </div>
        <div class="controls">
          <button @click="$emit('back')">Cancel</button>
          <button class="submit" @click="addConnection">
            Add connection
          </button>
        </div>
      </div>
      <div class="community" style="flex: 2">
        <h1 class="community-title">Which communities do this person belong to?</h1>
        <ul class="community-list">
          <li v-for="community in communities" :key="community.id">
            <button
              :class="[
                'community-item',
                { selected: connection.communities.includes(community.id) },
              ]"
              :style="`color: ${community.color}`"
              @click="toggleCommunity(community.id)"
            >
              <span class="community-color"></span>
              <span class="community-name">
                {{ community.name }}
              </span>
            </button>
          </li>
          <li v-if="Object.keys(communities).length < 10">
            <button class="community-item" @click="showCommunityForm = true">
              <span class="community-color" style="color: var(--cos-color-tertiary)">
                <tapestry-icon icon="plus" />
              </span>
              <span class="community-name" style="color: var(--cos-color-tertiary)">
                Add new
              </span>
            </button>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script>
import { VEmojiPicker } from "v-emoji-picker"
import TapestryIcon from "@/components/common/TapestryIcon"
import AddCommunityForm from "../AddCommunityForm"

export default {
  components: {
    AddCommunityForm,
    TapestryIcon,
    VEmojiPicker,
  },
  model: {
    prop: "connection",
    event: "change",
  },
  props: {
    communities: {
      type: Object,
      required: true,
    },
    connection: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showPicker: false,
      isInputTouched: false,
      showCommunityForm: false,
    }
  },
  computed: {
    isNameValid() {
      return !this.isInputTouched || this.connection.name.length > 0
    },
  },
  mounted() {
    const handleClick = evt => {
      if (!evt.target.closest("#emoji-picker")) {
        this.showPicker = false
      }
    }
    document.addEventListener("click", handleClick)
    this.$once("hook:destroyed", () => {
      document.removeEventListener("click", handleClick)
    })
  },
  methods: {
    toggleCommunity(communityId) {
      if (this.connection.communities.includes(communityId)) {
        this.connection.communities = this.connection.communities.filter(
          id => id !== communityId
        )
      } else {
        this.connection.communities.push(communityId)
      }
    },
    handleEmojiSelect(event) {
      this.connection.avatar = event.data
      this.showPicker = false
    },
    addConnection() {
      this.isInputTouched = true

      this.$nextTick(async () => {
        if (!this.isNameValid) {
          return
        }
        this.isInputTouched = false
        this.$emit("submit")
      })
    },
    handleAddCommunity(community) {
      this.$emit("add-community", community)
      this.showCommunityForm = false
    },
  },
}
</script>

<style scoped>
form {
  display: flex;
  column-gap: 3rem;
  padding: 2rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

button {
  background: none;
  margin: 0;
  padding: 0;
  color: inherit;
}

.connection-name {
  font-size: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  display: block;
  font-weight: 500;
}

.community {
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem 2rem 1rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.community-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #7f88af;
  margin-bottom: 2rem;
}

.community-list {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(5, 1fr);
  row-gap: 1rem;
  column-gap: 3rem;
}

.community-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  column-gap: 1.5rem;
}

.community-item:hover .community-color {
  background: currentColor;
}

.community-item.selected .community-color {
  background: currentColor;
}

.community-color {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid currentColor;
  height: 100%;
  width: 4rem;
  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
}

.community-name {
  display: block;
  border: 1px solid var(--cos-color-tertiary);
  width: 100%;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  color: black;
  font-size: 1.25rem;
}

.connection {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  justify-content: space-between;
}

.preview {
  font-size: 12rem;
  line-height: 1;
}

.picker {
  position: absolute;
  left: calc(100% + 2rem);
  top: 50%;
  transform: translateY(-55%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.controls {
  color: #757575;
  display: flex;
  column-gap: 1rem;
}

.submit {
  border: var(--cos-border);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.submit:hover {
  background: var(--cos-color-secondary);
  color: white;
}
</style>

<style>
.emoji.border {
  border: none !important;
}
</style>
