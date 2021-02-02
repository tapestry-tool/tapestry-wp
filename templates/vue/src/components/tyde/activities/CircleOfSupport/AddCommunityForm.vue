<template>
  <div class="content">
    <b-overlay :show="isLoading" style="width: 100%">
      <form @submit.stop.prevent>
        <div class="community" style="flex: 1">
          <input
            v-model="community.name"
            name="community name"
            class="community-name"
            type="text"
            placeholder="community"
            @blur="isInputTouched = true"
          />
          <b-form-invalid-feedback :state="isNameValid">
            Please enter a name for your community.
          </b-form-invalid-feedback>
          <div id="emoji-picker" style="position: relative">
            <button class="preview" @click="showPicker = !showPicker">
              {{ community.icon }}
            </button>
            <div v-show="showPicker" class="picker" data-qa="emoji-picker">
              <v-emoji-picker @select="community.icon = $event.data" />
            </div>
          </div>
          <div class="controls">
            <button @click="$emit('back')">Cancel</button>
            <button class="submit" @click="addCommunity">
              Add community
            </button>
          </div>
        </div>
        <div
          class="community-preview"
          :style="{ flex: 1, '--color': community.color }"
        ></div>
        <ul class="colors" style="flex: 1">
          <li v-for="color in colors" :key="color" :style="{ '--color': color }">
            <button
              :class="['color', { active: color === community.color }]"
              @click="community.color = color"
            ></button>
          </li>
        </ul>
      </form>
    </b-overlay>
  </div>
</template>

<script>
import { VEmojiPicker } from "v-emoji-picker"
// import client from "@/services/TapestryAPI"

// TODO: Implement navigation to add community
export default {
  components: {
    VEmojiPicker,
  },
  data() {
    return {
      community: {
        name: "",
        icon: "😊",
        color: "",
      },
      showPicker: false,
      isLoading: false,
      isInputTouched: false,
    }
  },
  computed: {
    colors() {
      return [
        "#FF7878",
        "#FDAB96",
        "#FF9A3E",
        "#FDDC80",
        "#EDF138",
        "#95FDBD",
        "#4EB945",
        "#3DF1C6",
        "#EC79D3",
        "#C182F2",
        "#8E77EB",
        "#5F3AF1",
        "#105FFA",
        "#4BB0F9",
        "#68DCF5",
        "#9AF8EC",
      ]
    },
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
    async addCommunity() {
      // stub
    },
  },
}
</script>

<style scoped lang="scss">
.content {
  height: 100%;
  display: flex;
}

form {
  display: flex;
  column-gap: 3rem;
  height: 100%;
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

.community {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  justify-content: space-between;
}

.community-name {
  font-size: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  display: block;
  font-weight: 500;
}

.colors {
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem 2rem;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.color {
  background: var(--color);
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    width: 130%;
    height: 130%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 4px solid var(--color);
    border-radius: 50%;
    opacity: 0;
  }

  &.active,
  &:hover {
    &:after {
      opacity: 1;
    }
  }
}

.community-preview {
  background: var(--color, var(--cos-color-secondary));
  margin-bottom: -3rem;
  border-top-left-radius: 9999px;
  border-top-right-radius: 9999px;
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
