<template>
  <div class="cos">
    <button @click="addConnection">Add connection</button>
    <button @click="updateConnection">Update connection</button>
    <connections
      class="connections"
      :connections="cos.connections"
      :communities="cos.communities"
    />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

import Connections from "./Connections"

export default {
  components: {
    Connections,
  },
  data() {
    return {
      cos: {
        circles: [],
        communities: {
          abcdef: {
            id: "abcdef",
            name: "School",
            icon: "🎓",
            color: "#A1BCFC",
          },
        },
        connections: {
          abc: {
            id: "abc",
            name: "Nanda",
            avatar: "🤡",
          },
          def: {
            id: "def",
            name: "Shirley",
            avatar: "😊",
          },
        },
        members: {},
      },
    }
  },
  /* async mounted() {
    const latestCosVersion = await client.cos.getActivity()
    this.cos = latestCosVersion
  }, */
  methods: {
    async addConnection() {
      const connection = await client.cos.addConnection({
        name: "Nanda",
        avatar: "🤔",
      })
      this.$set(this.cos.connections, connection.id, connection)
    },
    async updateConnection() {
      const [id, currentConnection] = Object.entries(this.cos.connections)[0]
      const connection = await client.cos.updateConnection(id, {
        ...currentConnection,
        avatar: "🤡",
      })
      this.cos.connections[id] = connection
    },
  },
}
</script>

<style scoped>
.cos {
  --cos-color-primary: #000;
  --cos-color-secondary: #c4c4c4;
  --cos-color-tertiary: #d8d8d8;
  --cos-border: 3px solid var(--cos-color-secondary);

  border: var(--cos-border);
  height: 600px;
  position: relative;
}

.connections {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
