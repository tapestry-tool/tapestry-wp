<template>
  <form>
    <div style="flex: 4;">
      <input v-model="name" type="text" placeholder="connection" />
      <p class="preview">{{ avatar }}</p>
    </div>
    <div class="section" style="flex: 7;">
      <h1 class="community-title">Which communities do this person belong to?</h1>
      <ul>
        <li v-for="community in communities" :key="community.id">
          <button>
            {{ community.name }}
          </button>
        </li>
      </ul>
    </div>
    <ul class="section">
      <li v-for="emoji in emojis" :key="emoji">
        <button
          :class="['emoji', { active: emoji === avatar }]"
          @click="avatar = emoji"
        >
          {{ emoji }}
        </button>
      </li>
    </ul>
  </form>
</template>

<script>
export default {
  props: {
    communities: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      name: "",
      avatar: "😊",
    }
  },
  computed: {
    emojis() {
      return ["😊", "🤡", "🥸", "🥷", "🤴🏾"]
    },
  },
}
</script>

<style scoped>
form {
  display: flex;
  column-gap: 3rem;
  align-items: center;
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
  color: revert;
}

.community-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #7f88af;
}

.section {
  border: var(--cos-border);
  border-radius: 1.5rem;
  padding: 1rem;
  height: 100%;
}

.emoji {
  font-size: 3rem;
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
}

.emoji:hover {
  background: rgba(0, 0, 0, 0.1);
}

.emoji.active {
  background: var(--cos-color-tertiary);
}

input {
  font-size: 1.5rem;
  text-align: center;
  text-transform: uppercase;
}

.preview {
  font-size: 8rem;
}
</style>
