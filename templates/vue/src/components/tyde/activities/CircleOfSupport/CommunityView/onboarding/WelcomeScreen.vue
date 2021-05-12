<template>
    <div class="modal ob-font">
    <b-container fluid class="center">
        <b-row align-h="center">
          <h1>Welcome to your <br /> circle of connections!</h1>
        </b-row >

        <b-row align-h="center">
          <p class="ob-secondary">Let's start with you — what communities are you a part of?</p>
        </b-row>
        
        <b-row align-h="center" class="ob-secondary">
          <p>Here are a few ideas to get you started.</p>
        </b-row>

        <b-row align-h="center" class="mt-2 mb-2">
          <b-button pill variant="secondary" @click="addCommunities" :disabled="canContinue()">CONTINUE &#8594 </b-button>
        </b-row>
        
        <b-row >
          <b-container>
            <b-row>
              <b-col v-for="community in communities" :key="community.name">
                <input v-model="communitiesToAdd" type="checkbox" :value="community.name" />
                <h3>{{ community.name }}</h3>
                <h1>{{ community.icon }}</h1>
              </b-col>
            </b-row>
          </b-container>
        </b-row>

    </b-container>
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
    canContinue(){
      return this.communitiesToAdd.length === 0 ? true : false;
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

<style scoped lang="scss">
* {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
button {
  letter-spacing: 1px;
  padding: 1px 25px;
}

h1, h3{
  color: $onbording-title-color;
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  z-index: 999;
  background-color: white;

  border: $onbording-border-color solid;
  border-radius:  15px;
}

</style>