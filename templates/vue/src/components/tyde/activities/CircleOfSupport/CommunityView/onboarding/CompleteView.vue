<template>
  <cos-modal show>
    <b-container >
        <b-row align-h="center">
            <b-col v-for="connection in visibleConnections.slice(0,3)">
                <p class="ob-connection">{{ connection.name }}</p>
                <h1>{{ connection.avatar }}</h1>
            </b-col>
        </b-row>
        <b-row align-h="center">
            <h3>Great job! Here are some of <br /> your connections.</h3>
        </b-row>
        <b-row align-h="center">
            <h5 class="ob-secondary">You'll be able to edit and add more at any time.</h5>
        </b-row>
        <b-row align-h="center">
            <b-col v-show="visibleConnections.length >= 4">
                <p class="ob-connection">{{ visibleConnections[3].name }}</p>
                <h1>{{ visibleConnections[3].avatar }}</h1>
            </b-col>
            <b-col align-self="center">
               <b-button pill variant="secondary" class="secondary" @click="">Connection &#8594</b-button> 
            </b-col>
            <b-col v-show="visibleConnections.length == 5">
                <p class="ob-connection">{{ visibleConnections[4].name }}</p>
                <h1>{{ visibleConnections[4].avatar }}</h1>
            </b-col>
        </b-row>
    </b-container>
  </cos-modal>
</template>

<script>
import CosModal from "../CosModal"

export default {
  components: {
    CosModal,
  },
  props: {
      connections :{
          require:true
      }
  },
  computed: {
      visibleConnections(){
        let connectionsArray = Object.values(this.connections)
        return connectionsArray.slice(0, Math.min(connectionsArray.length,5))
      }
  },
  methods: {

  }
}
</script>

<style scoped>
.row {
    padding: 10px 0;
}
</style>
