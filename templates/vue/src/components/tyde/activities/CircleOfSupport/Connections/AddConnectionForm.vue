<template>
  <form>
    <div class="connection" style="flex: 1">
      <input v-model="connection.name" type="text" placeholder="connection" />
      <div id="emoji-picker" style="position: relative">
        <button class="preview" @click="showPicker = !showPicker">
          {{ connection.avatar }}
        </button>
        <div v-show="showPicker" class="picker">
          <v-emoji-picker @select="connection.avatar = $event.data" />
        </div>
      </div>
      <div class="controls">
        <button>Cancel</button>
        <button class="submit">Add connection</button>
      </div>
    </div>
    <div class="community" style="flex: 2">
      <h1 class="community-title">Which communities do this person belong to?</h1>
      <ul>
        <li v-for="community in communities" :key="community.id">
          <button>
            {{ community.name }}
          </button>
        </li>
      </ul>
    </div>
  </form>
</template>

<script>
import { VEmojiPicker } from "v-emoji-picker"

export default {
  components: {
    VEmojiPicker,
  },
  props: {
    communities: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      connection: {
        name: "",
        avatar: "😊",
      },
      showPicker: false,
    }
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
    selectEmoji(emoji) {
      this.connection.avatar = emoji.data
    },
  },
}
</script>

<style scoped>
form {
  display: flex;
  column-gap: 3rem;
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

input {
  font-size: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  display: block;
}

.community {
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem;
  height: 100%;
}

.community-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #7f88af;
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
  transition: transform 0.2s ease-out;
}

.preview:hover {
  transform: translateY(1rem);
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
</style>

<style>
.emoji.border {
  border: none !important;
}
</style>
