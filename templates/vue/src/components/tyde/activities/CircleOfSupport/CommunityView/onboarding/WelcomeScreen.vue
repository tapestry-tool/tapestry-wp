<template>
  <div>
    <h1>Welcome to your circle of connections!</h1>
    <p>Let's start with you — what communities are you a part of?</p>
    <p>Here are a few ideas to get you started.</p>
    <button @click="addCommunities">Continue</button>
    <ul>
      <li v-for="community in communities" :key="community.name">
        <input v-model="communitiesToAdd" type="checkbox" :value="community.name" />
        <h1>{{ community.name }}</h1>
        <p>{{ community.icon }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { STARTER_COMMUNITIES } from "./onboarding.config"
import client from "@/services/TapestryAPI"

export default {
  data() {
    return {
      communitiesToAdd: [],
    }
  },
  computed: {
    communities() {
      return STARTER_COMMUNITIES
    },
  },
  methods: {
    toggle(community) {
      this.isChecked(community)
        ? this.communitiesToAdd.delete(community)
        : this.communitiesToAdd.add(community)
    },
    isChecked(community) {
      return this.communitiesToAdd.has(community)
    },
    async addCommunities() {
      const results = []
      if (this.communitiesToAdd.length > 0) {
        for (const communityName of this.communitiesToAdd) {
          results.push(
            await client.cos.addCommunity(
              this.communities.find(community => community.name === communityName)
            )
          )
        }
      }
      this.$emit("continue", results)
    },
  },
}
</script>
