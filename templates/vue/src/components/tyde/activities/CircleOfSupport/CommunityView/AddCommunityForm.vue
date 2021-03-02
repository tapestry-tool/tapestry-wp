<template>
  <div class="content">
    <b-overlay :show="isLoading" style="width: 100%">
      <form @submit.stop.prevent>
        <div class="community" style="flex: 1">
          <input
            :value="community.name"
            name="community name"
            class="community-name"
            type="text"
            placeholder="community"
            @change="handleChange('name', $event.target.value)"
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
              <v-emoji-picker @select="handleChange('icon', $event.data)" />
            </div>
          </div>
          <div class="controls">
            <button @click="$emit('back')">Cancel</button>
            <button class="submit" @click="saveCommunity">
              {{ submitLabel }}
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
              @click="handleChange('color', color)"
            ></button>
          </li>
        </ul>
      </form>
    </b-overlay>
  </div>
</template>

<script>
import { VEmojiPicker } from "v-emoji-picker"
import client from "@/services/TapestryAPI"

export default {
  components: {
    VEmojiPicker,
  },
  model: {
    prop: "community",
    event: "change",
  },
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
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
      return !this.isInputTouched || this.community.name.length > 0
    },
    isEdit() {
      return Boolean(this.community.id)
    },
    submitLabel() {
      return this.isEdit ? "Save community" : "Add community"
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
    handleChange(prop, value) {
      this.$emit("change", { ...this.community, [prop]: value })
    },
    saveCommunity() {
      this.isInputTouched = true
      this.$nextTick(async () => {
        if (!this.isNameValid) {
          return
        }
        this.isLoading = true
        const community = this.isEdit
          ? await client.cos.updateCommunity(
              this.community.id,
              this.cleanCommunity(this.community)
            )
          : await client.cos.addCommunity(this.community)
        // Reset the community object
        this.$emit("change", {
          name: "",
          icon: "👨‍👩‍👦",
          color: "",
        })
        this.isLoading = false
        this.isInputTouched = false
        this.$emit("add-community", community)
      })
    },
    /**
     * Clean up the community properties to only those that match the schema in the
     * README.
     *
     * This is necessary because we add other properties to render the community
     * correctly in <communities-list>.
     */
    cleanCommunity(community) {
      const { id, name, icon, color, connections } = community
      return {
        id,
        name,
        icon,
        color,
        connections: connections.map(connection =>
          typeof connection !== "string" ? connection.id : connection
        ),
      }
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
  column-gap: clamp(1rem, 8vw, 3rem);
  height: 100%;
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
  width: 100%;
}

.colors {
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem 2rem;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 0.5rem;
  row-gap: 1rem;
  align-items: center;
}

.color {
  background: var(--color);
  width: clamp(2rem, 5vw, 4rem);
  height: clamp(2rem, 5vw, 4rem);
  border-radius: 50%;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    width: 120%;
    height: 120%;
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
  font-size: clamp(7rem, 10vw, 10rem);
  line-height: 1;
}

.picker {
  position: absolute;
  left: calc(100% + 2rem);
  top: 50%;
  transform: translateY(-55%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.controls {
  color: #757575;
  display: flex;
  column-gap: 1rem;
  font-size: 1.2em;
}

.submit {
  background: #757575;
  color: white;
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
